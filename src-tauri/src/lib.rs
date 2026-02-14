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
use hound::{SampleFormat, WavSpec, WavWriter};
use image::{ImageFormat, RgbaImage};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone)]
struct Scene {
    id: String,
    fps: u32,
    canvasSize: CanvasSize,
    props: HashMap<String, Prop>,
    audio: Option<String>,
    precompute: Vec<Scene>,
    frames: Vec<Script>,
}

#[derive(Deserialize, Serialize, Clone)]
struct CanvasSize {
    width: u32,
    height: u32,
}

#[derive(Deserialize, Serialize, Clone)]
struct Prop {
    id: String,
    sprites: Vec<String>,
    propType: String,      // "image" | "video"
    compositeType: String, // "copy" | "paste"

    width: Option<u32>,
    height: Option<u32>,
    colour: Option<[u8; 3]>,

    disabled: Option<bool>,
}

#[derive(Debug, Clone)]
struct LoadedProp {
    id: String,
    sprites: Vec<RgbaImage>,
    propType: String,      // "image" | "video"
    compositeType: String, // "copy" | "paste"

    width: u32,
    height: u32,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct Script {
    id: String,
    props: Vec<StageDirection>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct StageDirection {
    id: Option<String>,
    prop: String,
    sprite: Option<usize>,
    x: u32,
    y: u32,
    width: Option<u32>,
    height: Option<u32>,
}

#[derive(Serialize)]
struct VideoData {
    width: u32,
    height: u32,
    durationSec: f64,
    audioSampleRate: u32,
    datetime: String, // ISO string
    fps: f64,
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
            getVideoData,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn generateFrame(
    frame: usize,
    script: Script,
    props: Arc<HashMap<String, LoadedProp>>,
    canvasSize: Arc<CanvasSize>,
) -> Result<Vec<u8>, String> {
    // spawn blocking compute
    let startTotal = Instant::now();

    // 1. prepare blank canvas
    let mut canvas = RgbaImage::new(canvasSize.width, canvasSize.height);

    // 2. composite images
    for stageDirection in script.props.iter() {
        // fetch image from props
        let loadedProp = props
            .get(&stageDirection.prop)
            .ok_or(format!("prop not found: {}", &stageDirection.prop))?;
        // let img = &loadedProp.image;

        // compute coordinates
        // use mandated dimensions, if given, else use actual
        let width = stageDirection.width.unwrap_or(loadedProp.width);
        let height = stageDirection.height.unwrap_or(loadedProp.height);
        let px = stageDirection.x.min(canvasSize.width.saturating_sub(width));
        let py = stageDirection
            .y
            .min(canvasSize.height.saturating_sub(height));

        // scale image if needed to prop.width/prop.height
        // let imgResized = img.resize_exact(stageDirection.width, stageDirection.height, image::imageops::FilterType::Nearest);

        // overlay on canvas
        let spriteIndex = match loadedProp.propType.as_str() {
            "video" => stageDirection
                .sprite
                .unwrap_or(0)
                .min(loadedProp.sprites.len() - 1),
            _ => stageDirection.sprite.unwrap_or(0),
        };
        if loadedProp.compositeType == "paste" {
            fastCopyImage(&mut canvas, &loadedProp.sprites[spriteIndex], px, py);
        }
        else if loadedProp.compositeType == "overlay" {
            image::imageops::overlay(
                &mut canvas,
                &loadedProp.sprites[spriteIndex],
                px as i64,
                py as i64,
            );
        }
    }

    // 4. return data
    println!("Frame {}: {:?}", frame, startTotal.elapsed());
    Ok(canvas.into_raw())
}

#[tauri::command]
async fn renderFrame(payload: serde_json::Value) -> Result<String, String> {
    println!("renderFrame() called");

    let scene: Scene =
        serde_json::from_value(payload).map_err(|e| format!("failed to deserialize: {}", e))?;

    // render
    let frameProp = loadFrame(scene, Some(1))?;

    // convert the loaded image to base64
    let mut buf = Cursor::new(Vec::new());
    let canvas = &frameProp.sprites[0];
    canvas
        .write_to(&mut buf, ImageFormat::Png)
        .map_err(|e| format!("failed to encode PNG: {}", e))?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.get_ref());

    println!("Frame rendered");
    Ok(format!("data:image/png;base64,{}", b64))
}

fn loadFrame(scene: Scene, stub: Option<u64>) -> Result<LoadedProp, String> {
    println!("rendering frame of {}", scene.id.clone());
    // 1. load props
    let mut props = loadProps(&scene.props, stub)?;
    let canvasSize = Arc::new(scene.canvasSize.clone());

    // 2. precompute complex assets
    for precompute in scene.precompute.iter() {
        println!("precomputing {}", precompute.id.clone());
        let loaded = loadFrame(precompute.clone(), stub)?;
        props.insert(
            precompute.id.clone(),
            LoadedProp {
                id: loaded.id.clone(),
                sprites: loaded.sprites.clone(),
                propType: "image".into(),
                compositeType: "paste".into(),
                width: loaded.width,
                height: loaded.height,
            },
        );
        println!("precomputed {}!", precompute.id.clone());
    }
    for (id, prop) in props.iter() {
        println!(
            "{} => type: {}, sprites: {} frames, {}x{}",
            id,
            prop.propType,
            prop.sprites.len(),
            prop.width,
            prop.height
        );
    }
    let props = Arc::new(props);

    // 3. generate frames
    let mut loadedFrames = Vec::new();
    for (i, frameScript) in scene.frames.iter().enumerate() {
        let bytes = generateFrame(i, frameScript.clone(), props.clone(), canvasSize.clone(),)?;
        let image =
            image::RgbaImage::from_raw(scene.canvasSize.width, scene.canvasSize.height, bytes)
                .ok_or(format!("invalid canvas size at frame {}", i))?;
        loadedFrames.push(image);
    }

    Ok(LoadedProp {
        id: scene.id.clone(),
        sprites: loadedFrames,
        propType: "image".into(),
        compositeType: "paste".into(),
        width: scene.canvasSize.width,
        height: scene.canvasSize.height,
    })
}

#[tauri::command]
async fn renderVideo(payload: serde_json::Value) -> Result<String, String> {
    println!("renderVideo() called");

    // 1. deserialise payload as Scene
    let scene: Scene =
        serde_json::from_value(payload).map_err(|e| format!("failed to deserialize: {}", e))?;

    // 2. load props
    let mut props = loadProps(&scene.props, None)?;
    let canvasSize = Arc::new(scene.canvasSize.clone());

    // 3. precompute complex assets
    for precompute in scene.precompute.iter() {
        println!("precomputing {}", precompute.id.clone());
        let loaded = loadFrame(precompute.clone(), None)?;
        props.insert(
            precompute.id.clone(),
            LoadedProp {
                id: loaded.id.clone(),
                sprites: loaded.sprites.clone(),
                propType: "image".into(),
                compositeType: "paste".into(),
                width: loaded.width,
                height: loaded.height,
            },
        );
    }
    let props = Arc::new(props);

    // 4. generate frames
    let mut frames: Vec<Vec<u8>> = Vec::new();
    for (i, frame) in scene.frames.iter().enumerate() {
        let frame = generateFrame(
            i,
            frame.clone(),
            // cloning Arc does not clone underlying data
            props.clone(),
            canvasSize.clone(),
        )?;
        frames.push(frame);
        println!("generated frame {}/{}", frames.len(), scene.frames.len());
    }

    // let outputFile = TEMP_DIR.join("output.mp4"); // XXX
    let outputFile = format!("{}/bin/{}.mp4", *PROJECT_DIR, scene.id);

    // 5. encode video (ffmpeg)
    let mut ffmpeg = std::process::Command::new("ffmpeg")
        .args([
            "-y",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgba",
            "-video_size",
            &format!("{}x{}", canvasSize.width, canvasSize.height),
            "-framerate",
            &format!("{}", scene.fps),
            "-i",
            "-",
            "-i",
            &format!(
                "{}/public/{}",
                *PROJECT_DIR,
                scene.audio.ok_or("no audio track provided")?
            ),
            "-map",
            "0:v",
            "-map",
            "1:a",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
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
            stdin
                .write(&frameBytes)
                .map_err(|e| format!("failed to write to ffmpeg stdin: {}", e))?;
        }
    }

    let status = ffmpeg
        .wait()
        .map_err(|e| format!("ffmpeg wait error: {}", e))?;
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
            "-i",
            &videoPath,
            "-ac",
            "1", // mono
            "-f",
            "f32le", // raw float PCM
            "-ar",
            &audioSampleRate.to_string(),
            "-ss",
            "0",
            // "-t", "duration",
            "-",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("failed to spawn ffmpeg: {}", e))?;

    let stdout = ffmpeg
        .stdout
        .as_mut()
        .ok_or("failed to open ffmpeg stdout")?;
    let mut buf = Vec::new();
    stdout
        .read_to_end(&mut buf)
        .map_err(|e| format!("failed to read ffmpeg stdout: {}", e))?;

    let status = ffmpeg
        .wait()
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
    let mut writer =
        WavWriter::create(&wavPath, spec).map_err(|e| format!("failed to create wav: {}", e))?;
    for sample in &floats {
        writer
            .write_sample(*sample)
            .map_err(|e| format!("failed to write sample: {}", e))?;
    }
    writer
        .finalize()
        .map_err(|e| format!("failed to finalize wav: {}", e))?;

    // return raw data to frontend
    println!("Audio extracted");
    Ok(floats)
}

#[tauri::command]
fn getVideoData(path: &str) -> Result<VideoData, String> {
    println!("getVideoData() called");

    let output = std::process::Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,avg_frame_rate,r_frame_rate,duration",
            "-show_entries",
            "format_tags=creation_time",
            "-of",
            "json",
            path,
        ])
        .output()
        .map_err(|e| format!("ffprobe failed: {}", e))?;

    if !output.status.success() {
        return Err("ffprobe exited with error".into());
    }

    let json: serde_json::Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("failed to parse ffprobe output: {}", e))?;

    let stream = &json["streams"][0];
    let format = &json["format"];

    let width = stream["width"].as_u64().unwrap_or(1920) as u32;
    let height = stream["height"].as_u64().unwrap_or(1080) as u32;
    let durationSec = stream["duration"]
        .as_str()
        .or(format["duration"].as_str())
        .unwrap_or("0")
        .parse::<f64>()
        .unwrap_or(0.0);
    let audioSampleRate = json["streams"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .find(|s| s["codec_type"] == "audio")
        .and_then(|a| a["sample_rate"].as_str())
        .unwrap_or("48000")
        .parse::<u32>()
        .unwrap_or(48000);
    let datetime = format["tags"]["creation_time"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let fps_str = stream["avg_frame_rate"]
    .as_str()
    .or(stream["r_frame_rate"].as_str())
    .unwrap_or("0/1");
    let fps = if let Some((num, den)) = fps_str.split_once('/') {
        let num: f64 = num.parse().unwrap_or(0.0);
        let den: f64 = den.parse().unwrap_or(1.0);
        if den != 0.0 { num / den } else { 0.0 }
    }
    else {
        fps_str.parse::<f64>().unwrap_or(0.0)
    };

    Ok(VideoData {
        width,
        height,
        durationSec,
        audioSampleRate,
        datetime,
        fps,
    })
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

fn loadProps(props: &HashMap<String, Prop>, stub: Option<u64>) -> Result<HashMap<String, LoadedProp>, String> {
    let mut loadedProps: HashMap<String, LoadedProp> = HashMap::new();
    for (id, prop) in props.iter() {
        if prop.disabled == Some(true) {
            continue;
        }
        let mut loadedSprites: Vec<RgbaImage> = Vec::new();
        if prop.propType == "image" {
            // load all images as array (spritesheet)
            for spritePath in prop.sprites.iter() {
                let img = image::open(spritePath)
                    .map_err(|e| {
                        format!(
                            "failed to open sprite {} for prop {}: {}",
                            spritePath, &prop.id, e
                        )
                    })?
                    .to_rgba8();
                loadedSprites.push(img);
            }
        }
        else if prop.propType == "video" {
            // load all frames into image array
            loadedSprites = loadVideoFrames(
                &prop.sprites[0],
                prop.width.unwrap_or(1920),
                prop.height.unwrap_or(1080),
                stub,
            )?;
        }
        else if prop.propType == "colour" {
            if let Some(colour) = &prop.colour {
                // extract RGB
                let r = colour[0];
                let g = colour[1];
                let b = colour[2];

                // create an image of the given size filled with the colour
                let width = prop.width.unwrap_or(1920);
                let height = prop.height.unwrap_or(1080);
                let mut img = image::RgbaImage::new(width, height);

                for px in img.pixels_mut() {
                    *px = image::Rgba([r, g, b, 255]);
                }
                loadedSprites.push(img);
            }
            else {
                return Err(format!("Colour prop {} has no colour value", &prop.id));
            }
        }

        let mut width = 0;
        let mut height = 0;
        if let Some(first) = loadedSprites.first() {
            // read actual dimensions from loaded sprites
            width = first.width();
            height = first.height();
        }

        loadedProps.insert(
            id.clone(),
            LoadedProp {
                id: id.clone(),
                sprites: loadedSprites,
                propType: prop.propType.clone(),
                compositeType: prop.compositeType.clone(),
                width,
                height,
            },
        );
    }
    Ok(loadedProps)
}

fn loadVideoFrames(
    path: &str,
    width: u32,
    height: u32,
    stub: Option<u64>,
) -> Result<Vec<RgbaImage>, String> {

    let mut cmd = std::process::Command::new("ffmpeg")
        .args([
            "-i", path,
            "-f", "rawvideo",
            "-pix_fmt", "rgba",
            "-vf", &format!("scale={}x{}", width, height),
            "-",
        ])
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to spawn ffmpeg: {}", e))?;

    let stdout = cmd.stdout.as_mut().ok_or("failed to open ffmpeg stdout")?;
    let frameSize = (width * height * 4) as usize;

    let maxFrames = stub.unwrap_or(u64::MAX);
    let mut frames = Vec::new();
    let mut buf = vec![0u8; frameSize];

    for _ in 0..maxFrames {
        match stdout.read_exact(&mut buf) {
            Ok(_) => {
                let img = RgbaImage::from_raw(width, height, buf.clone())
                    .ok_or("failed to convert chunk to RgbaImage")?;
                frames.push(img);
            }
            Err(e) if e.kind() == std::io::ErrorKind::UnexpectedEof => {
                break; // no more frames
            }
            Err(e) => {
                return Err(format!("failed to read frame: {}", e));
            }
        }
    }

    let _ = cmd.kill(); // stop ffmpeg early if we exited via stub
    let _ = cmd.wait();

    Ok(frames)
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
                (w * 4) as usize,
            );
        }
    }
}
