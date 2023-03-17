process.stdin.setEncoding('utf-8');

let textContent = '';

process.stdin.on('data', (chunk) => {
  textContent += chunk;
});

process.stdin.on('end', () => {
    console.log(`Received text content: ${textContent}`);
    // do something with the text content
    "use strict";
    const fs = require('fs')
    var sdk = require("microsoft-cognitiveservices-speech-sdk");
    var readline = require("readline");
    var key = '496cd2faca1346e19be3b6135014ac6f';
    var region = 'brazilsouth';

    var audioFile = "YourAudioFile.mp3";
    // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = "pt-BR-YaraNeural"; 

    // Create the speech synthesizer.
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

   
      // Start the synthesizer and wait for a result.
      synthesizer.speakTextAsync(textContent,
          function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("synthesis finished.");
        } else {
          console.error("Speech synthesis canceled, " + result.errorDetails +
              "\nDid you set the speech resource key and region values?");
        }
        synthesizer.close();
        synthesizer = null;
      },
          function (err) {
        console.trace("err - " + err);
        synthesizer.close();
        synthesizer = null;
      });
      console.log("Now synthesizing to: " + audioFile);
    /*if (fs.existsSync('YourAudioFile.m4a')){
        fs.createWriteStream('YourAudioFile.m4a', { flag:'w' });
    }else {
        fs.writeFile('YourAudioFile.m4a');
    }*/

  });