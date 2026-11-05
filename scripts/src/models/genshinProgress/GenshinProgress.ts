import type { GenshinPhaseProgress } from "#src/models/genshinProgress/GenshinPhaseProgress";

// The report: every phase from 0 to the last Genshin phase, and how many units hold no phase at all
export interface GenshinProgress {
  phases: GenshinPhaseProgress[];
  unphased: number;
}
