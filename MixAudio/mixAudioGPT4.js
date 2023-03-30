const fs = require('fs');
const wav = require('node-wav');
const MusicTempo = require('music-tempo');
const wavEncoder = require('wav-encoder');

function createAudioBuffer(numberOfChannels, length, sampleRate) {
  return {
    numberOfChannels,
    length,
    sampleRate,
    channelData: [],
  };
}

function readAndDecode(file) {
  const data = fs.readFileSync(file);
  return wav.decode(data);
}

function extractTempo(audio, defaultTempo) {
  try {
    return new MusicTempo(audio.channelData[0]).tempo;
  } catch (error) {
    console.error("Tempo extraction failed:", error);
    return defaultTempo;
  }
}

function alignAudio(audio, tempo, delay) {
  const delaySamples = Math.ceil(delay * audio.sampleRate);
  const delayedData = audio.channelData.map((channelData) => {
    const paddedData = new Float32Array(channelData.length + delaySamples);
    for (let i = 0; i < channelData.length; i++) {
      paddedData[i + delaySamples] = channelData[i];
    }
    return paddedData;
  });

  const newBuffer = createAudioBuffer(audio.numberOfChannels, delayedData[0].length, audio.sampleRate);
  newBuffer.channelData = delayedData;
  return newBuffer;
}

function mixAudio(audio1, audio2, callback) {
  const result = [];
  const minLength = Math.min(audio1.channelData[0].length, audio2.channelData[0].length);
  for (let i = 0; i < minLength; i++) {
    result.push((audio1.channelData[0][i] + audio2.channelData[0][i]) / 2);
  }

  const mixedBuffer = createAudioBuffer(audio1.numberOfChannels, result.length, audio1.sampleRate);
  mixedBuffer.channelData = [new Float32Array(result)];
  callback(mixedBuffer);
}
function processFiles(vocalPath, instrumentalPath, vocalTempo, instrumentalTempo) {
  const vocal = readAndDecode(vocalPath,instrumentalPath);
  const instrumental = readAndDecode(instrumentalPath);

  const vocalBpm = extractTempo(vocal, vocalTempo);
  const instrumentalBpm = extractTempo(instrumental, instrumentalTempo);

  const vocalDelay = 0.05;
  const instrumentalDelay = -30;

  const secondsPerBeatVocal = 60 / vocalBpm;
  const secondsPerBeatInstrumental = 60 / instrumentalBpm;

  const alignedVocal = alignAudio(vocal, vocalBpm, vocalDelay);
  const alignedInstrumental = alignAudio(instrumental, instrumentalBpm, instrumentalDelay * secondsPerBeatInstrumental);

  mixAudio(alignedVocal, alignedInstrumental, (mixed) => {
    const audioData = {
      sampleRate: mixed.sampleRate,
      channelData: mixed.channelData,
    };

    wavEncoder.encode(audioData).then((buffer) => {
      return new Uint8Array(buffer);
    }).catch((error) => {
      console.error('Error encoding WAV file:', error);
    });
  });
}
module.exports = {
  processFiles
};