import type { Chroma } from "#src/models/genshinParity/Chroma";

import { computeSpectrogram } from "#src/services/genshinAssets/computeSpectrogram";
import {
  CHROMA_FRAME_LENGTH,
  CHROMA_HOP_LENGTH,
  CHROMA_MAX_FREQUENCY,
  CHROMA_MIN_FREQUENCY,
} from "#src/services/genshinParity/constants";
import { normalizeChromaClasses } from "#src/services/genshinParity/normalizeChromaClasses";

// A signal's pitch classes frame by frame: each Hann-windowed frame's spectrum folded onto the twelve semitones of
// The equal-tempered scale about A440 between the lowest and highest frequency read, normalised
// (`normalizeChromaClasses`). A frame's loudness is kept beside its classes, so a quiet frame is left out of a
// Comparison
export const computeChroma = (samples: Float32Array, sampleRate: number): Chroma => {
  const { binCount, frameCount, magnitudes } = computeSpectrogram(
    samples,
    sampleRate,
    CHROMA_FRAME_LENGTH,
    CHROMA_HOP_LENGTH,
  );
  const classes = new Float32Array(frameCount * 12);
  const loudness = new Float32Array(frameCount);
  const binClasses = Int8Array.from({ length: binCount }, (_, bin) => {
    const frequency = (bin * sampleRate) / CHROMA_FRAME_LENGTH;
    if (bin === 0 || frequency < CHROMA_MIN_FREQUENCY || frequency > CHROMA_MAX_FREQUENCY) return -1;
    return ((Math.round(69 + 12 * Math.log2(frequency / 440)) % 12) + 12) % 12;
  });
  for (let frame = 0; frame < frameCount; frame++) {
    const offset = frame * 12;
    for (const [bin, pitchClass] of binClasses.entries()) {
      if (pitchClass < 0) continue;
      const magnitude = magnitudes[frame * binCount + bin] ?? 0;
      classes[offset + pitchClass] = (classes[offset + pitchClass] ?? 0) + magnitude;
      loudness[frame] = (loudness[frame] ?? 0) + magnitude;
    }
  }
  normalizeChromaClasses(classes);
  return { classes, loudness };
};
