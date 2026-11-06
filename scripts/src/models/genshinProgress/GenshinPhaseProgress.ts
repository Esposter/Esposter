import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";
import type { GenshinProgressRow } from "#src/models/genshinProgress/GenshinProgressRow";

// One phase's progress: its name, its number, its rows by kind and its exit checks
export interface GenshinPhaseProgress {
  checks: GenshinExitCheck[];
  name: string;
  phase: number;
  rows: GenshinProgressRow[];
}
