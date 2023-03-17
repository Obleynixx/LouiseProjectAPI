import os
import openai
import sys
import json
import time

openai.api_key = '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'
def RecognizeText():
    audio_file = open("Audios/audio.webm", "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    print (transcript)
    while transcript is None:
        continue
    
    with open('result.txt', 'w') as f:
        f.write(json.dumps({"text": transcript}))
        
if __name__ == '__main__':
    RecognizeText()