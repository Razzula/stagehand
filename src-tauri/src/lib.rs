use std::process::Command;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![renderBasicVideo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn renderBasicVideo(templateImage: String, videoFile: String, outputFile: String) -> Result<(), String> {
    // 1. Get duration of video
    let duration_output = Command::new("ffprobe")
        .args(&["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", &videoFile])
        .output()
        .map_err(|e| e.to_string())?;
    let duration = String::from_utf8(duration_output.stdout).map_err(|e| e.to_string())?;

    // 2. ffmpeg command to loop image and attach audio
    let status = Command::new("ffmpeg")
        .args(&[
            "-y",
            "-loop", "1",
            "-i", &templateImage,
            "-i", &videoFile,
            "-map", "0:v",
            "-map", "1:a",
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-t", &duration.trim(),
            "-pix_fmt", "yuv420p",
            "-shortest",
            "-c:a", "copy",
            &outputFile
        ])
        .status()
        .map_err(|e| e.to_string())?;
    
    if status.success() {
        Ok(())
    } else {
        Err("ffmpeg failed".into())
    }
}
