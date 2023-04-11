// Attaching an event listener to the 'recorded-audio' element for when the audio data is loaded
document.getElementById('recorded-audio').addEventListener('loadeddata', async (event) => {
  const audioElement = event.target;

  // If the audio element has no source, return immediately
  if (!audioElement.src) return;

  // Show "Calculating BPM..." in the 'bpmResult' element while the BPM is being calculated
  const bpmResultElement = document.getElementById('bpmResult');
  bpmResultElement.textContent = 'Calculating BPM...';

  // Fetch the audio data as an ArrayBuffer
  const response = await fetch(audioElement.src);
  const arrayBuffer = await response.arrayBuffer();

  // Decode the audio data into an AudioBuffer
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Estimate the BPM of the audio and display it in the 'bpmResult' element
  const bpm = await estimateBPM(audioContext, audioBuffer);
  bpmResultElement.textContent = `BPM: ${bpm.toFixed(2)}`;
});

// Downsample the given buffer to the target sample rate
function downsampleBuffer(buffer, sampleRate, targetSampleRate) {
  if (targetSampleRate === sampleRate) {
    return buffer;
  }
  const ratio = sampleRate / targetSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const index = Math.round(i * ratio);
    result[i] = buffer[index];
  }
  return result;
}

// Estimate the BPM of an audio buffer
async function estimateBPM(audioContext, audioBuffer) {
  // Set up the audio processing graph
  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  const bufferSize = 16384;
  const recorder = audioContext.createScriptProcessor(bufferSize, 1, 1);

  source.buffer = audioBuffer;
  source.connect(gainNode);
  gainNode.connect(recorder);
  recorder.connect(audioContext.destination);

  // Prepare to collect audio samples from the buffer
  let samples = new Float32Array(audioBuffer.length);
  let currentPosition = 0;

  // Collect samples on each audio processing event
  recorder.onaudioprocess = (event) => {
    const inputData = event.inputBuffer.getChannelData(0);
    const availableSpace = samples.length - currentPosition;
    const samplesToCopy = Math.min(inputData.length, availableSpace);

    samples.set(inputData.subarray(0, samplesToCopy), currentPosition);
    currentPosition += samplesToCopy;
  };

  // Start playing the audio buffer
  source.start(0);

  // Estimate the BPM when the buffer has finished playing
  return new Promise((resolve) => {
    source.onended = () => {
      // Clean up the audio processing graph
      recorder.disconnect();
      gainNode.disconnect();
      source.disconnect();

      // Downsample the collected samples
      const downsampledRate = 8000;
      samples = downsampleBuffer(samples, audioBuffer.sampleRate, downsampledRate);

      // Set the start offset and duration of the segment for BPM calculation
      const startOffset = 0;
      const duration = 5;

      // Calculate the start and end sample indices
      const startIndex = Math.round(startOffset * audioBuffer.sampleRate);
      const endIndex = Math.min(Math.round((startOffset + duration) * audioBuffer.sampleRate), samples.length);

      // Extract the segment from the samples array
      const segmentSamples = samples.slice(startIndex, endIndex);
      const sampleRate = downsampledRate;

      // Set the BPM search range
      const minBPM = 20;
      const maxBPM = 300;

      // Define the autocorrelation function
      const autocorrelation = (offset) => {
        let sum = 0;
        for (let i = 0; i < segmentSamples.length - offset; i++) {
          sum += segmentSamples[i] * segmentSamples[i + offset];
        }
        return sum;
      };

      // Set the search range for offsets
      const minOffset = Math.round(sampleRate / (maxBPM / 60));
      const maxOffset = Math.round(sampleRate / (minBPM / 60));

      // Set the step size for faster calculation
      const stepSize = 32;

      // Find the offset with the best correlation
      let bestOffset = -1;
      let bestCorrelation = -Infinity;
      for (let offset = minOffset; offset <= maxOffset; offset += stepSize) {
        const corr = autocorrelation(offset);
        if (corr > bestCorrelation) {
          bestCorrelation = corr;
          bestOffset = offset;
        }
      }

      // Calculate the BPM from the best offset
      const bpm = 60 / (bestOffset / sampleRate);

      // Set the tolerance for BPM doubling/halving
      const tolerance = 0.15;

      // Check for BPM doubling or halving and resolve the promise with the final BPM
      if (Math.abs(2 * bpm - 100) / 100 < tolerance) {
        resolve(2 * bpm);
      } else if (Math.abs(0.5 * bpm - 100) / 100 < tolerance) {
        resolve(0.5 * bpm);
      } else {
        resolve(bpm);
      }
    };
  });
}
