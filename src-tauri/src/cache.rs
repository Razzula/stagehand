use sha2::{Sha256, Digest};
use std::fs;
use std::path::{Path, PathBuf};
use directories::BaseDirs;

fn cacheRoot() -> PathBuf {
    let base = BaseDirs::new().expect("no home dir");
    base.cache_dir().join("stagehand").join("cache")
}

fn cachePath(key: &str, kind: &str) -> PathBuf {
    cacheRoot().join(format!("{key}.{kind}.json"))
}

pub fn readCache(key: &str, kind: &str) -> Option<String> {
    let path = cachePath(key, kind);
    fs::read_to_string(path).ok()
}

pub fn writeCache(key: &str, kind: &str, data: &str) -> Result<(), String> {
    let path = cachePath(key, kind);

    fs::create_dir_all(path.parent().unwrap())
        .map_err(|e| e.to_string())?;

    fs::write(path, data).map_err(|e| e.to_string())
}

pub fn hashAudioFile(path: &Path, extra: &str) -> Result<String, String> {
    let data = fs::read(path).map_err(|e| e.to_string())?;

    let mut hasher = Sha256::new();
    hasher.update(&data);
    hasher.update(extra.as_bytes());

    let result = hasher.finalize();
    Ok(hex::encode(result))
}
