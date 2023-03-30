import os
import sys
import json
import time
import openai
openai.api_key = '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'
def RecognizeText():
    audio_file_path = "Audios/audio.webm"
    if os.path.isfile(audio_file_path):
        transcript = openai.Audio.transcribe("whisper-1", open(audio_file_path, "rb"))
    else:
        audio_file_path = "Audios/audio.m4a"
        if not os.path.isfile(audio_file_path):
            print("Error: Audio file not found")
            return
        transcript = openai.Audio.transcribe("whisper-1", open(audio_file_path, "rb"))

    print (transcript)
    while transcript is None:
        continue
    
    with open('result.txt', 'w') as f:
        f.write(json.dumps({"text": transcript}))
        
if __name__ == '__main__':
    RecognizeText()