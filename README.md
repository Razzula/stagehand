# Stagehand

## Prerequisites
```python
# .env
VITE_STAGEHAND_ROOT=CHANGEME
HF_TOKEN=CHANGEME
```
```bash
bun install
```
```bash
# src-tauri/src-py
cd ./src-tauri/src-py/
python3 -m venv .venv
./.venv/bin/pip install pyannote.audio
```
```bash
# src-tauri/src-py (optional)
./.venv/bin/pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu120
```

## Running
```bash
# in repo root
bun run dev
```

## Building
```bash
# in repo root
bun run build
bun run preview
```

## Acknowledgements

Artwork of [`testplate.png`](./public/assets/testplate.png) by Joshua Bond
