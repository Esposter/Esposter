import { PERCENT } from "#src/services/voiceMatch/constants";

// The prosody adjustment that takes a candidate's measurement to the reference's, as the signed whole percentage the
// Markup reads: a ratio of two medians, so no search is run for it
export const getShiftPercentage = (reference: number, candidate: number): number =>
  Math.round((reference / candidate - 1) * PERCENT);
