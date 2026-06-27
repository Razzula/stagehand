# Stagehand

## Prerequisites
### System
```sh
sudo apt update
sudo apt install ffmpeg libavutil-dev libavcodec-dev libavformat-dev
```

```python
# .env
VITE_STAGEHAND_ROOT=CHANGEME
HF_TOKEN=CHANGEME
```

### Python
ML is powered by Python. This has been split into separate modules, to avoid version oconflicts between multiplepre-trained models.
```sh
# transcription using WhisperX
# run in ./src-tauri/src-py
python3.11 -m venv .transcribe
source ./.transcribe/bin/activate
pip install -r transcribe.txt
```
```sh
# diarisation using pyannote/speaker-diarization-community-1
# run in ./src-tauri/src-py
python3.11 -m venv .diarise
source ./.diarise/bin/activate
pip install -r diarise.txt
```

### Tauri App
```bash
bun install
```

## Running
```bash
bun run dev
```

## Building
```bash
bun run build
bun run preview
```

## Acknowledgements

- Original artwork of Kiwi and Razz assets © Joshua Bond
- Additional assets © Jack Gillespie
- D&D characters © Ryan Sullivan, Jack Gillespie
