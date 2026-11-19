import type { BloomResize } from "#src/models/genshinParity/passes/BloomResize";
import type { GameBloomStructure } from "genshin-engine";

// One structure of the bloom chain read at one measurement: its reading over each bloom reference, in CIELab ΔE,
// Negative where the drawn bloom closes (`computeBloomReading`), Infinity where a reference shows no white to read
export interface BloomAblationRow {
  measurement: BloomResize;
  readings: Record<string, number>;
  structure: GameBloomStructure;
}
