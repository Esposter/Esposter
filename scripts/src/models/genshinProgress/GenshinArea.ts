import type { ComputeKind } from "#src/models/fleet/ComputeKind";

// A compute page as the report counts it: its folder, kind and phase, the needs of each runnable item, the blocker each
// Waiting item names, the count of open lines that carry no id and the parity ids its items compare
export interface GenshinArea {
  blockers: string[];
  folder: string;
  kind: ComputeKind;
  needs: string[][];
  parityIds: string[];
  phase: number;
  skipped: number;
}
