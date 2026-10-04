import { CHROMA_QUIET_SHARE } from "#src/services/genshinParity/shared/constants";

// The frames a score reads: those whose loudness reaches a share of the loudest's, so a rest costs nothing
export const computeAudibleFrames = (loudness: Float32Array): number[] => {
  const quiet = Math.max(...loudness) * CHROMA_QUIET_SHARE;
  return [...loudness.keys()].filter((frame) => (loudness[frame] ?? 0) >= quiet);
};
