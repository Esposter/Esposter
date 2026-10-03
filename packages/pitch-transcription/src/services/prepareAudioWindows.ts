import type { Tensor3D } from "@tensorflow/tfjs";

import { AUDIO_WINDOW_SAMPLES, OVERLAP_SAMPLES, WINDOW_HOP_SAMPLES } from "#src/constants";
import { concat1d, expandDims, signal, tensor1d, tidy, zeros } from "@tensorflow/tfjs";

// One channel cut into the windows the model reads, a window to a row: half an overlap of silence first so the first
// Frames are read whole, then windows a hop apart, the last padded with silence
export const prepareAudioWindows = (samples: Float32Array): Tensor3D =>
  tidy(() => {
    const padded = concat1d([zeros([OVERLAP_SAMPLES / 2]), tensor1d(samples)]);
    return expandDims(signal.frame(padded, AUDIO_WINDOW_SAMPLES, WINDOW_HOP_SAMPLES, true, 0), -1);
  });
