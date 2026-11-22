import { createHash } from "node:crypto";

// A unit's place in the order a seed draws the units in: the same seed and unit always rank the same, so a rerun of the
// Sample with its seed reads the same units
export const getSeededRank = (seed: string, unit: string): string =>
  createHash("sha256").update(`${seed} ${unit}`).digest("hex");
