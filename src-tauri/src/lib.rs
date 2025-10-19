#![allow(unused_parens)]
#![allow(non_snake_case)]

use std::clone::Clone;
use std::process::Command;
use std::path::PathBuf;

use base64::Engine;
use serde::{Deserialize, Serialize};
use image::{DynamicImage, RgbaImage, GenericImage};
use once_cell::sync::Lazy;

#[derive(Deserialize, Serialize)]
struct Scene {
    id: String,
    canvasSize: CanvasSize,
    props: Vec<Prop>,
}

#[derive(Deserialize, Serialize)]
struct CanvasSize {
    width: u32,
    height: u32,
}

#[derive(Deserialize, Serialize, Clone)]
struct Prop {
    id: Option<String>,
    #[serde(rename = "type")]
    propType: String, // "image" | "clear"
    x: u32,
    y: u32,
    width: u32,
    height: u32,
    src: Option<String>,
}

static TEMP_DIR: Lazy<PathBuf> = Lazy::new(|| {
    let mut dir = std::env::temp_dir();
    dir.push("stagehand");
    std::fs::create_dir_all(&dir).expect("failed to create temp dir");
    dir
});

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            renderFrame,
            renderVideo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn generateFrame(payload: serde_json::Value) -> Result<String, String> {
    // spawn blocking compute
    let path = tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        // 1. deserialize payload -> TemplatePayload (serde)
        let scene: Scene = serde_json::from_value(payload)
            .map_err(|e| format!("failed to deserialize: {}", e))?;

        // 2. load images: image::open(path)
        let mut images: Vec<(Prop, DynamicImage)> = Vec::new();
        for prop in scene.props.iter() {
            if (prop.propType == "image") {
                let src = prop.src.as_ref().ok_or("missing src")?;
                let img = image::open(src).map_err(|e| format!("failed to open {}: {}", src, e))?;
                images.push((prop.clone(), img));
            }
        }

        let mut canvas = RgbaImage::new(scene.canvasSize.width, scene.canvasSize.height);

        // 3. composite images
        for (prop, img) in images.iter() {
            // compute coordinates
            let px = prop.x.min(scene.canvasSize.width.saturating_sub(prop.width));
            let py = prop.y.min(scene.canvasSize.height.saturating_sub(prop.height));

            // scale image if needed to prop.width/prop.height
            let img_resized = img.resize_exact(prop.width, prop.height, image::imageops::FilterType::Nearest);

            // overlay on canvas
            image::imageops::overlay(&mut canvas, &img_resized, px as i64, py as i64);
        }

        // 4. write composited canvas to temp file
        let temp_file = TEMP_DIR
            .join(scene.id)
            .with_extension("png");
        DynamicImage::ImageRgba8(canvas)
            .save(&temp_file)
            .map_err(|e| format!("failed to save PNG: {}", e))?;

        // 5. return absolute path string
        Ok(temp_file.to_string_lossy().to_string())
    })
    .await
    .map_err(|e| format!("spawn error: {}", e))??;

    Ok(path)
}

#[tauri::command]
async fn renderFrame(payload: serde_json::Value) -> Result<String, String> {
    // render the frame
    let temp_file = generateFrame(payload).await?;
    // return base64 data URL
    let bytes = std::fs::read(&temp_file)
        .map_err(|e| format!("failed to read temp PNG: {}", e))?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:image/png;base64,{}", b64))
}

#[tauri::command]
async fn renderVideo(payload: serde_json::Value) -> Result<String, String> {
    // 1. deserialise payload as Vec<Scene>
    let scenes: Vec<Scene> = serde_json::from_value(payload)
        .map_err(|e| format!("failed to deserialize scenes: {}", e))?;


    // 2. generate frames
    for scene in scenes.into_iter() {
        let frame_path = generateFrame(serde_json::to_value(scene).unwrap()).await?;
    }

    // let output_file = TEMP_DIR.join("output.mp4"); // XXX
    let output_file = String::from("/media/razzula/media2/Programming/Web/stagehand/bin/out2.mp4");

    // 3. call ffmpeg
    let status = std::process::Command::new("ffmpeg")
        .args([
            "-y",
            "-framerate", "30", // XXX
            "-i", TEMP_DIR.join("frame_%d.png").to_str().unwrap(),
            "-i", "/media/razzula/media2/Programming/Web/stagehand/public/assets/sample.mp4", // XXX
            "-map", "0:v",
            "-map", "1:a",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-shortest",
            &output_file.to_string(),
        ])
        .status()
        .map_err(|e| format!("ffmpeg failed: {}", e))?;

    if !status.success() {
        return Err(format!("ffmpeg exited with {}", status));
    }

    Ok(output_file.to_string().to_string())
}


