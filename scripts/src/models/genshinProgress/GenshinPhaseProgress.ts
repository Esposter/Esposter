import type { GenshinProgressRow } from "#src/models/genshinProgress/GenshinProgressRow";

// One phase's progress: its name, its number and its rows by kind
export interface GenshinPhaseProgress {
  name: string;
  phase: number;
  rows: GenshinProgressRow[];
}
