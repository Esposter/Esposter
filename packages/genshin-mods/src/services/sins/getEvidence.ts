import { SIN_TOP_LEVEL } from "./constants";

// The score is the probability-weighted level, so it is already the evidence once it is scaled to a share of the top level
export const getEvidence = (score: number): number => Math.min(1, Math.max(0, score / SIN_TOP_LEVEL));
