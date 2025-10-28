# 1. visit hf.co/pyannote/speaker-diarization and accept user conditions
# 2. visit hf.co/pyannote/segmentation and accept user conditions
# 3. visit https://huggingface.co/pyannote/speaker-diarization-community-1 and accept user conditions
# 4. visit hf.co/settings/tokens to create an access token
import sys
import json

from pyannote.audio import Pipeline
    
def diarise(audioPath: str, hfToken: str):
    pipeline = Pipeline.from_pretrained(
        'pyannote/speaker-diarization-community-1',
        token=hfToken
    )

    output = pipeline(audioPath)
    return output.speaker_diarization

def main():
    if len(sys.argv) != 3:
        print(f'Usage: {sys.argv[0]} <HF_TOKEN> <AUDIO_FILE>')
        sys.exit(1)

    hfToken = sys.argv[1]
    audioFile = sys.argv[2]
    
    segments = diarise(audioFile, hfToken)
    output = {}
    for turn, speaker in segments:
        output.setdefault(speaker, []).append([f'{turn.start:.3f}', f'{turn.end:.3f}'])

    print(json.dumps(output))

if (__name__ == '__main__'):
    main()
