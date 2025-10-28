#![allow(unused_parens)]
#![allow(non_snake_case)]

use std::clone::Clone;
use std::collections::HashMap;
use std::env;
use std::io::{Cursor, Read, Write};
use std::path::PathBuf;
use std::process::Stdio;
use std::sync::Arc;
use std::time::Instant;

use base64::Engine;
use dotenvy::dotenv;
use hound::{WavWriter, WavSpec, SampleFormat};
use image::{RgbaImage, ImageFormat};
use once_cell::sync::Lazy;
use serde::Deserialize;

#[derive(Deserialize)]
struct Scene {
    id: Option<String>,
    canvasSize: CanvasSize,
    props: HashMap<String, Prop>,
    frames: Vec<Script>,
    outputPath: Option<String>,
}

#[derive(Deserialize, Clone)]
struct CanvasSize {
    width: u32,
    height: u32,
}

#[derive(Deserialize)]
struct Prop {
    id: String,
    sprites: Vec<String>,
}

struct LoadedProp {
    id: String,
    sprites: Vec<RgbaImage>,
}

#[derive(Deserialize, Clone)]
struct Script {
    id: String,
    props: Vec<StageDirection>,
}

#[derive(Deserialize, Clone)]
struct StageDirection {
    id: Option<String>,
    prop: String,
    sprite: Option<usize>,
    #[serde(rename = "type")]
    propType: String, // "image" | "paste"
    x: u32,
    y: u32,
    width: u32,
    height: u32,
}

static TEMP_DIR: Lazy<PathBuf> = Lazy::new(|| {
    let mut dir = std::env::temp_dir();
    dir.push("stagehand");
    std::fs::create_dir_all(&dir).expect("failed to create temp dir");
    dir
});

static PROJECT_DIR: Lazy<String> = Lazy::new(|| {
    dotenv().ok(); // loads .env in repo root
    env::var("VITE_STAGEHAND_ROOT").expect("VITE_STAGEHAND_ROOT must be set")
});

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            renderFrame,
            renderVideo,
            extractAudio,
            diariseAudio,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn generateFrame(script: Script, props: Arc<HashMap<String, LoadedProp>>, canvasSize: Arc<CanvasSize>) -> Result<Vec<u8>, String> {

    // spawn blocking compute
    let bytes = tauri::async_runtime::spawn_blocking(move || -> Result<Vec<u8>, String> {
        let startTotal = Instant::now();

        // 1. prepare blank canvas
        let mut canvas = RgbaImage::new(canvasSize.width, canvasSize.height);

        // 2. composite images
        for stageDirection in script.props.iter() {
            // fetch image from props
            let loadedProp = props.get(&stageDirection.prop)
                .ok_or(format!("prop not found: {}", &stageDirection.prop))?;
            // let img = &loadedProp.image;

            // compute coordinates
            let px = stageDirection.x.min(canvasSize.width.saturating_sub(stageDirection.width));
            let py = stageDirection.y.min(canvasSize.height.saturating_sub(stageDirection.height));

            // scale image if needed to prop.width/prop.height
            // let imgResized = img.resize_exact(stageDirection.width, stageDirection.height, image::imageops::FilterType::Nearest);

            // overlay on canvas
            if stageDirection.propType == "paste" {
                fastCopyImage(
                    &mut canvas,
                    &loadedProp.sprites[stageDirection.sprite.unwrap_or(0)],
                    px,
                    py,
                );
            }
            else if stageDirection.propType == "image" {
                image::imageops::overlay(
                    &mut canvas,
                    &loadedProp.sprites[stageDirection.sprite.unwrap_or(0)],
                    px as i64, py as i64,
                );
            }
        }

        // 4. return data
        println!("Total frame generation: {:?}", startTotal.elapsed());
        // Ok(buf.into_inner())
        Ok(canvas.into_raw())
    })
    .await
    .map_err(|e| format!("spawn error: {}", e))??;

    Ok(bytes)
}

#[tauri::command]
async fn renderFrame(payload: serde_json::Value) -> Result<String, String> {
    println!("renderFrame() called");

    let scene: Scene = serde_json::from_value(payload)
        .map_err(|e| format!("failed to deserialize: {}", e))?;

    let props = Arc::new(loadProps(&scene.props)?);
    let canvasSize = Arc::new(scene.canvasSize.clone());

    // render the frame
    let bytes = generateFrame(
        scene.frames[0].clone(),
        props,
        canvasSize.clone(),
    ).await?;

    // return base64 data URL
    let mut buf = Cursor::new(Vec::new());
    let canvas = RgbaImage::from_raw(canvasSize.width, canvasSize.height, bytes)
        .ok_or("invalid canvas size")?;
    canvas.write_to(&mut buf, ImageFormat::Png)
        .map_err(|e| format!("failed to encode PNG: {}", e))?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.get_ref());

    println!("Frame rendered");
    Ok(format!("data:image/png;base64,{}", b64))
}

#[tauri::command]
async fn renderVideo(payload: serde_json::Value) -> Result<String, String> {
    println!("renderVideo() called");

    // 1. deserialise payload as Scene
    let scene: Scene = serde_json::from_value(payload)
        .map_err(|e| format!("failed to deserialize: {}", e))?;

    // 2. load props
    let props = Arc::new(loadProps(&scene.props)?);
    let canvasSize = Arc::new(scene.canvasSize.clone());

    // 3. generate frames
    let mut frames: Vec<Vec<u8>> = Vec::new();
    for frame in scene.frames.iter() {
        let frame = generateFrame(
            frame.clone(),
            // cloning Arc does not clone underlying data
            props.clone(),
            canvasSize.clone(),
        ).await?;
        frames.push(frame);
        println!("generated frame {}/{}", frames.len(), scene.frames.len());
    }

    // let outputFile = TEMP_DIR.join("output.mp4"); // XXX
    let outputFile = format!("{}/bin/out2.mp4", *PROJECT_DIR);

    // 4. encode video (ffmpeg)
    let mut ffmpeg = std::process::Command::new("ffmpeg")
        .args([
            "-y",
            "-f", "rawvideo",
            "-pix_fmt", "rgba",
            "-video_size", &format!("{}x{}", canvasSize.width, canvasSize.height),
            "-framerate", "30", // XXX needs to be parameterised
            "-i", "-",
            "-i", &format!("{}/public/assets/sample.mp4", *PROJECT_DIR),
            "-map", "0:v",
            "-map", "1:a",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            // "-shortest",
            &outputFile.to_string(),
        ])
        .stdin(Stdio::piped())
        .spawn()
        .map_err(|e| format!("ffmpeg failed: {}", e))?;

    // stream each frame's PNG bytes to ffmpeg stdin
    {
        let stdin = ffmpeg.stdin.as_mut().ok_or("failed to open ffmpeg stdin")?;
        for frameBytes in frames {
            stdin.write(&frameBytes)
                .map_err(|e| format!("failed to write to ffmpeg stdin: {}", e))?;
        }
    }

    let status = ffmpeg.wait().map_err(|e| format!("ffmpeg wait error: {}", e))?;
    if !status.success() {
        return Err(format!("ffmpeg exited with {}", status));
    }

    println!("Video rendered");
    Ok(outputFile.to_string())
}

#[tauri::command]
async fn extractAudio(videoPath: String, audioSampleRate: u32) -> Result<Vec<f32>, String> {
    println!("extractAudio() called");

    // extract audio
    let mut ffmpeg = std::process::Command::new("ffmpeg")
        .args([
            "-i", &videoPath,
            "-ac", "1",       // mono
            "-f", "f32le",    // raw float PCM
            "-ar", &audioSampleRate.to_string(),
            "-ss", "0",
            // "-t", "duration",
            "-",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("failed to spawn ffmpeg: {}", e))?;

    let stdout = ffmpeg.stdout.as_mut().ok_or("failed to open ffmpeg stdout")?;
    let mut buf = Vec::new();
    stdout.read_to_end(&mut buf)
        .map_err(|e| format!("failed to read ffmpeg stdout: {}", e))?;

    let status = ffmpeg.wait()
        .map_err(|e| format!("ffmpeg wait failed: {}", e))?;
    if !status.success() {
        return Err(format!("ffmpeg exited with {:?}", status.code()));
    }

    // decode to f32 samples
    let mut floats = Vec::with_capacity(buf.len() / 4);
    for chunk in buf.chunks_exact(4) {
        let sample = f32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]);
        floats.push(sample);
    }

    // save as temp .wav file
    let spec = WavSpec {
        channels: 1,
        sample_rate: audioSampleRate,
        bits_per_sample: 32,
        sample_format: SampleFormat::Float,
    };
    let wavPath = TEMP_DIR.join("audio.wav");
    let mut writer = WavWriter::create(&wavPath, spec)
    .map_err(|e| format!("failed to create wav: {}", e))?;
    for sample in &floats {
        writer.write_sample(*sample)
            .map_err(|e| format!("failed to write sample: {}", e))?;
    }
    writer.finalize()
        .map_err(|e| format!("failed to finalize wav: {}", e))?;

    // return raw data to frontend
    println!("Audio extracted");
    Ok(floats)
}

#[tauri::command]
async fn diariseAudio() -> Result<String, String> {
    println!("diariseAudio() called");

    dotenv().ok();
    let hfToken = env::var("HF_TOKEN").map_err(|_| "HF_TOKEN must be set".to_string())?;

    let output = std::process::Command::new("./src-py/.venv/bin/python3")
        .arg("src-py/test.py")
        .arg(&hfToken)
        .arg(TEMP_DIR.join("audio.wav")) // XXX
        .output()
        .map_err(|e| format!("Failed to spawn python: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Python script failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    println!("Audio diarised");
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn loadProps(props: &HashMap<String, Prop>) -> Result<HashMap<String, LoadedProp>, String> {
    let mut loadedProps: HashMap<String, LoadedProp> = HashMap::new();
    for (id, prop) in props.iter() {
        let mut loadedSprites: Vec<RgbaImage> = Vec::new();
        for spritePath in prop.sprites.iter() {
            let img = image::open(spritePath)
                .map_err(|e| format!("failed to open sprite {} for prop {}: {}", spritePath, &prop.id, e))?
                .to_rgba8();
            loadedSprites.push(img);
        }

        loadedProps.insert(id.clone(), LoadedProp {
            id: id.clone(),
            sprites: loadedSprites,
        });
    }
    Ok(loadedProps)
}

fn fastCopyImage(dest: &mut RgbaImage, src: &RgbaImage, x: u32, y: u32) {
    let (w, h) = src.dimensions();
    for row in 0..h {
        let destStart = ((y + row) * dest.width() + x) as usize * 4;
        let srcStart = (row * w) as usize * 4;
        unsafe {
            std::ptr::copy_nonoverlapping(
                src.as_ptr().add(srcStart),
                dest.as_mut_ptr().add(destStart),
                (w * 4) as usize
            );
        }
    }
}
