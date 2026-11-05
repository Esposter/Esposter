import type { ComputeKind } from "#src/models/fleet/ComputeKind";
import type { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";

// One kind's counts within a phase: its units by state, and the first blocker its waiting units name
export interface GenshinProgressRow {
  blocked: number;
  done: number;
  firstBlocker: string;
  kind: ComputeKind | GenshinProgressKind;
  runnable: number;
  units: number;
  waiting: number;
}
