import { SAMPLE_ONSET_SHARE } from "#src/services/genshinAssets/constants";

// How many seconds a recording runs before its sound starts: the first sample whose magnitude reaches
// `SAMPLE_ONSET_SHARE` of the recording's loudest
export const readRecordingOnset = (samples: Float32Array, sampleRate: number): number => {
  const threshold = samples.reduce((peak, sample) => Math.max(peak, Math.abs(sample)), 0) * SAMPLE_ONSET_SHARE;
  const onset = samples.findIndex((sample) => Math.abs(sample) >= threshold);
  return Math.max(onset, 0) / sampleRate;
};
