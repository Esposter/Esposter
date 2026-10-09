import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";
import type { Chroma } from "#src/models/genshinParity/music/Chroma";

import { normalizeChromaClasses } from "#src/services/genshinParity/music/normalizeChromaClasses";
import { CHROMA_MAX_FREQUENCY, CHROMA_MIN_FREQUENCY } from "#src/services/genshinParity/shared/constants";

// A signal's pitch classes frame by frame, read from its spectrogram in the pitch classes' frames
// (`computeChromaSpectrogram`):
// Each frame's spectrum folded onto the twelve semitones of the equal-tempered scale about A440 between the lowest and
// Highest frequency read, normalised (`normalizeChromaClasses`). A frame's loudness is kept beside its classes, so a
// Quiet frame is left out of a comparison
export const computeChroma = ({ binCount, frameCount, frameLength, magnitudes, sampleRate }: Spectrogram): Chroma => {
  const classes = new Float32Array(frameCount * 12);
  const loudness = new Float32Array(frameCount);
  const binClasses = Int8Array.from({ length: binCount }, (_value, bin) => {
    const frequency = (bin * sampleRate) / frameLength;
    if (bin === 0 || frequency < CHROMA_MIN_FREQUENCY || frequency > CHROMA_MAX_FREQUENCY) return -1;
    else return ((Math.round(69 + 12 * Math.log2(frequency / 440)) % 12) + 12) % 12;
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
