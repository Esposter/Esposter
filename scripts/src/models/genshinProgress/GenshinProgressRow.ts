import type { ComputeKind } from "#src/models/fleet/ComputeKind";
import type { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";

// One kind's counts within a phase: its units by state, the quests among them that a script names or none does, and the
// First blocker its waiting units name
export interface GenshinProgressRow {
  blocked: number;
  done: number;
  firstBlocker: string;
  kind: ComputeKind | GenshinProgressKind;
  notMeasurable: number;
  runnable: number;
  scripted: number;
  units: number;
  waiting: number;
}
