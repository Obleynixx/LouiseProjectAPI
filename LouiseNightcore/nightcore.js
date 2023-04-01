const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const inputPath = path.resolve('LouiseNightcore/Audio/audio.mp3'); // Replace with your input file path
const outputPath = path.resolve('LouiseNightcore/Output/nightcore.mp3'); // Replace with your output file path
let speed = '';// Adjust speed (range: 0.5 - 2.0)
let pitch = ''; // Adjust pitch (recommended range: 1.0 - 1.5)
process.stdin.setEncoding('utf-8');

process.stdin.on('data', (chunk) => {
  const input = chunk.toString().trim();
  const [speedVal, pitchVal] = input.split('&');
  speed=parseFloat(speedVal);
  pitch=parseFloat(pitchVal);
});
// Set the path to the FFmpeg executable if necessary
// ffmpeg.setFfmpegPath('path/to/your/ffmpeg');
process.stdin.on('end', () => {
// Set the path to the FFmpeg executable
ffmpeg.setFfmpegPath(ffmpegPath);

ffmpeg(inputPath)
  .audioFilters([
    `atempo=${speed}`,
    `asetrate=44100*${pitch}`,
  ])
  .output(outputPath)
  .on('start', async () => {
    console.log('Starting conversion...');
  })
  .on('end', () => {
    console.log(`Conversion finished: ${outputPath}`);
  })
  .on('error', (err) => {
    console.error('Error:', err.message);
  })
  .run();


 
})