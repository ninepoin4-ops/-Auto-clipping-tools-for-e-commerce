// Simple BPM Guesser based on peak intervals
export const detectBPM = async (audioBuffer: AudioBuffer): Promise<number> => {
  const offlineContext = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Low pass filter to isolate kick drum/bass
  const filter = offlineContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 150;
  
  source.connect(filter);
  filter.connect(offlineContext.destination);
  source.start(0);

  const renderedBuffer = await offlineContext.startRendering();
  const data = renderedBuffer.getChannelData(0);

  // Peak detection
  const peaks = [];
  const threshold = 0.3;
  const minPeerDistance = 0.25; // at least 0.25s between peaks (max 240bpm)
  
  for (let i = 0; i < data.length; i += 1000) {
    if (Math.abs(data[i]) > threshold) {
      if (peaks.length === 0 || (i / audioBuffer.sampleRate) - peaks[peaks.length - 1] > minPeerDistance) {
        peaks.push(i / audioBuffer.sampleRate);
      }
    }
  }

  if (peaks.length < 10) return 120; // Fallback

  // Calculate intervals
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  // Find most common interval (histogram)
  const histogram: {[key: string]: number} = {};
  intervals.forEach(interval => {
    // Round to nearest 0.01s
    const key = Math.round(interval * 20) / 20; 
    histogram[key] = (histogram[key] || 0) + 1;
  });

  let maxCount = 0;
  let bestInterval = 0.5; // Default 120bpm

  Object.entries(histogram).forEach(([intervalStr, count]) => {
    if (count > maxCount) {
      maxCount = count;
      bestInterval = parseFloat(intervalStr);
    }
  });

  const bpm = 60 / bestInterval;
  
  // Normalize to 70-160 range
  let finalBpm = bpm;
  while (finalBpm < 70) finalBpm *= 2;
  while (finalBpm > 160) finalBpm /= 2;

  return Math.round(finalBpm);
};

export const decodeAudioFile = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  // Fix for webkit prefix
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
  return await audioContext.decodeAudioData(arrayBuffer);
};