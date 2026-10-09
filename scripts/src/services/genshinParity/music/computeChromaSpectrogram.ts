import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";

import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH } from "#src/services/genshinParity/shared/constants";

// A signal's spectrogram in the pitch classes' frames, the one every comparison reads, so a caller computes it once
export const computeChromaSpectrogram = (samples: Float32Array, sampleRate: number): Spectrogram =>
  computeSpectrogram(samples, sampleRate, CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH);
