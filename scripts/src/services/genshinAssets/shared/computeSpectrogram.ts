import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";

import { transformFourier } from "genshin-engine";

// A signal's magnitude spectrum in Hann windows of `frameLength` samples, `hopLength` apart, from its first sample
export const computeSpectrogram = (
  samples: Float32Array,
  sampleRate: number,
  frameLength: number,
  hopLength: number,
): Spectrogram => {
  const frameCount = Math.max(0, Math.floor((samples.length - frameLength) / hopLength) + 1);
  const binCount = frameLength / 2;
  const magnitudes = new Float32Array(frameCount * binCount);
  const window = Float64Array.from(
    { length: frameLength },
    (_value, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / frameLength),
  );
  const real = new Float64Array(frameLength);
  const imaginary = new Float64Array(frameLength);
  for (let frame = 0; frame < frameCount; frame++) {
    for (let index = 0; index < frameLength; index++) {
      real[index] = (samples[frame * hopLength + index] ?? 0) * (window[index] ?? 0);
      imaginary[index] = 0;
    }
    transformFourier(real, imaginary);
    for (let bin = 0; bin < binCount; bin++)
      magnitudes[frame * binCount + bin] = Math.hypot(real[bin] ?? 0, imaginary[bin] ?? 0);
  }
  return { binCount, frameCount, frameLength, hopLength, magnitudes, sampleRate };
};
