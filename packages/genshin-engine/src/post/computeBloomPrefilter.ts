import { GENSHIN_BLOOM_SCALER, GENSHIN_BLOOM_THRESHOLD } from "#src/renderer/constants";

// One channel of a scene colour as the bloom's prefilter takes it, the light past the threshold scaled by the scaler and
// None under it: the CPU form of the prefilter the bloom node (`GameBloomNode`) draws per pixel, so a change to the
// Prefilter lands in both
export const computeBloomPrefilter = (channel: number): number =>
  Math.max(channel - GENSHIN_BLOOM_THRESHOLD, 0) * GENSHIN_BLOOM_SCALER;
