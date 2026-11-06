import type { ComputeKind } from "#src/models/fleet/ComputeKind";

// A compute page as the report counts it: its folder, kind and phase, the needs of each runnable item, the blocker each
// Waiting item names and the parity ids its items compare
export interface GenshinArea {
  blockers: string[];
  folder: string;
  kind: ComputeKind;
  needs: string[][];
  parityIds: string[];
  phase: number;
}
