# 1. visit hf.co/pyannote/speaker-diarization and accept user conditions
# 2. visit hf.co/pyannote/segmentation and accept user conditions
# 3. visit https://huggingface.co/pyannote/speaker-diarization-community-1 and accept user conditions
# 4. visit hf.co/settings/tokens to create an access token
import sys
import json
import time

import torch
from pyannote.audio import Pipeline
from pyannote.audio.pipelines.utils.hook import ProgressHook

def diarise(audioPath: str, hfToken: str, device, numSpeakers: int | None):

    pipeline = Pipeline.from_pretrained(
        'pyannote/speaker-diarization-community-1',
        token=hfToken,
    )
    pipeline.to(torch.device(device))

    # with ProgressHook() as hook:
    result = pipeline(
        audioPath, num_speakers=numSpeakers,
        # hook=hook,
    )

    diarisation = result.speaker_diarization

    output = {}
    segmentCount = 0

    for turn, _, speaker in diarisation.itertracks(yield_label=True):
        segmentCount += 1
        output.setdefault(speaker, []).append([
            round(turn.start, 3),
            round(turn.end, 3)
        ])

    print(f'[INFO] Segments: {segmentCount}', file=sys.stderr)

    return output


def run(audioPath: str, hfToken: str, numSpeakers: int | None):
    t0 = time.perf_counter()
    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    print(f'[INFO] Using device: {device}', file=sys.stderr)
    if torch.cuda.is_available():
        print(f'[INFO] GPU: {torch.cuda.get_device_name(0)}', file=sys.stderr)
        print(f'[INFO] VRAM allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB', file=sys.stderr)

    print('[INFO] Diarising...', file=sys.stderr)
    t1 = time.perf_counter()
    diarisation = diarise(audioPath, hfToken, device, numSpeakers)
    t2 = time.perf_counter()
    print(f'[INFO] Diarised: {t2 - t1:.2f}s', file=sys.stderr)

    tn = time.perf_counter()
    print(f'[INFO] Completed: {tn - t0:.2f}s', file=sys.stderr)
    return diarisation


def main():
    if len(sys.argv) < 3:
        print('Usage: diarise.py <AUDIO_FILE> <HF_TOKEN> [NUM_SPEAKERS]', file=sys.stderr)
        sys.exit(1)

    audioFile = sys.argv[1]
    hfToken = sys.argv[2]
    numSpeakers = int(sys.argv[3]) if len(sys.argv) >= 4 else None

    result = run(audioFile, hfToken, numSpeakers)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
