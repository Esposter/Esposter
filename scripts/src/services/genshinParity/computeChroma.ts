import type { Chroma } from "#src/models/genshinParity/Chroma";

import {
  CHROMA_FRAME_LENGTH,
  CHROMA_HOP_LENGTH,
  CHROMA_MAX_FREQUENCY,
  CHROMA_MIN_FREQUENCY,
} from "#src/services/genshinParity/constants";
import { transformFourier } from "#src/services/genshinParity/transformFourier";

// A signal's pitch classes frame by frame: each Hann-windowed frame's spectrum folded onto the twelve semitones of
// The equal-tempered scale about A440 between the lowest and highest frequency read, each frame's twelve weights less
// Their mean and scaled to unit length, so a frame of no pitch reads as zeros and two frames compare by their dot
// Product. A frame's loudness is kept beside its classes, so a quiet frame is left out of a comparison
export const computeChroma = (samples: Float32Array, sampleRate: number): Chroma => {
  const frameCount = Math.max(0, Math.floor((samples.length - CHROMA_FRAME_LENGTH) / CHROMA_HOP_LENGTH) + 1);
  const classes = new Float32Array(frameCount * 12);
  const loudness = new Float32Array(frameCount);
  const window = Float64Array.from(
    { length: CHROMA_FRAME_LENGTH },
    (_, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / CHROMA_FRAME_LENGTH),
  );
  const binClasses = Int8Array.from({ length: CHROMA_FRAME_LENGTH / 2 }, (_, bin) => {
    const frequency = (bin * sampleRate) / CHROMA_FRAME_LENGTH;
    if (bin === 0 || frequency < CHROMA_MIN_FREQUENCY || frequency > CHROMA_MAX_FREQUENCY) return -1;
    return ((Math.round(69 + 12 * Math.log2(frequency / 440)) % 12) + 12) % 12;
  });
  const real = new Float64Array(CHROMA_FRAME_LENGTH);
  const imaginary = new Float64Array(CHROMA_FRAME_LENGTH);
  for (let frame = 0; frame < frameCount; frame++) {
    for (let index = 0; index < CHROMA_FRAME_LENGTH; index++) {
      real[index] = (samples[frame * CHROMA_HOP_LENGTH + index] ?? 0) * (window[index] ?? 0);
      imaginary[index] = 0;
    }
    transformFourier(real, imaginary);
    const offset = frame * 12;
    for (const [bin, pitchClass] of binClasses.entries()) {
      if (pitchClass < 0) continue;
      const magnitude = Math.hypot(real[bin] ?? 0, imaginary[bin] ?? 0);
      classes[offset + pitchClass] = (classes[offset + pitchClass] ?? 0) + magnitude;
      loudness[frame] = (loudness[frame] ?? 0) + magnitude;
    }
    const frameClasses = classes.subarray(offset, offset + 12);
    const mean = frameClasses.reduce((sum, value) => sum + value, 0) / 12;
    for (const [index, value] of frameClasses.entries()) frameClasses[index] = value - mean;
    const norm = Math.hypot(...frameClasses) || 1;
    for (const [index, value] of frameClasses.entries()) frameClasses[index] = value / norm;
  }
  return { classes, loudness };
};
