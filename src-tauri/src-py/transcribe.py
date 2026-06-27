import sys
import json
import time
import logging

import torch

logging.getLogger().handlers.clear()
logging.getLogger().setLevel(logging.ERROR)
logging.basicConfig(stream=sys.stderr, level=logging.ERROR, force=True)

import whisperx

logging.getLogger("whisperx").setLevel(logging.ERROR)
logging.getLogger("whisperx.asr").setLevel(logging.ERROR)
logging.getLogger("whisperx.vads").setLevel(logging.ERROR)
logging.getLogger("pyannote").setLevel(logging.ERROR)


def transcribe(audioPath: str, device, language: str | None):
    model = whisperx.load_model('large-v3', device)

    audio = whisperx.load_audio(audioPath)
    result = model.transcribe(audio, language=language)

    alignModel, metadata = whisperx.load_align_model(
        language_code=result['language'],
        device=device
    )

    aligned = whisperx.align(
        result['segments'],
        alignModel,
        metadata,
        audio,
        device
    )

    words = []
    for seg in aligned['segments']:
        for w in seg.get('words', []):
            words.append({
                'word': w['word'],
                'start': float(w['start']),
                'end': float(w['end'])
            })

    return words


def run(audioPath: str, language: str | None):
    t0 = time.perf_counter()
    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    print(f'[INFO] Using device: {device}', file=sys.stderr)
    if torch.cuda.is_available():
        print(f'[INFO] GPU: {torch.cuda.get_device_name(0)}', file=sys.stderr)
        print(f'[INFO] VRAM allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB', file=sys.stderr)

    print('[INFO] Transcribing...', file=sys.stderr)
    t1 = time.perf_counter()
    transcript = transcribe(audioPath, device, language)
    t2 = time.perf_counter()
    print(f'[INFO] Transcribed: {t2 - t1:.2f}s', file=sys.stderr)

    tn = time.perf_counter()
    print(f'[INFO] Completed: {tn - t0:.2f}s', file=sys.stderr)
    return transcript


def main():
    if len(sys.argv) < 2:
        print('Usage: transcribe.py <AUDIO_FILE> [LANGUAGE]', file=sys.stderr)
        sys.exit(1)

    audioFile = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) >= 3 else None

    result = run(audioFile, language)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
