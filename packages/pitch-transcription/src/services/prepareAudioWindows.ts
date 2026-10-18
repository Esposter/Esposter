import { AUDIO_WINDOW_SAMPLES, OVERLAP_SAMPLES, WINDOW_HOP_SAMPLES } from "#src/constants";
import { Tensor } from "onnxruntime-common";

export interface AudioWindows {
  count: number;
  getWindow: (index: number) => Tensor;
}

// One channel cut into the windows the model reads: half an overlap of silence first so the first frames are read
// Whole, then windows a hop apart, the last run out into silence. Every window is a view over one padded buffer, so
// Holding them all costs no more than the recording
export const prepareAudioWindows = (samples: Float32Array): AudioWindows => {
  const paddedLength = OVERLAP_SAMPLES / 2 + samples.length;
  const count = Math.ceil(paddedLength / WINDOW_HOP_SAMPLES);
  const padded = new Float32Array((count - 1) * WINDOW_HOP_SAMPLES + AUDIO_WINDOW_SAMPLES);
  padded.set(samples, OVERLAP_SAMPLES / 2);
  return {
    count,
    getWindow: (index) => {
      const start = index * WINDOW_HOP_SAMPLES;
      return new Tensor("float32", padded.subarray(start, start + AUDIO_WINDOW_SAMPLES), [1, AUDIO_WINDOW_SAMPLES, 1]);
    },
  };
};
