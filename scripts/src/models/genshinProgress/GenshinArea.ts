import type { ComputeKind } from "#src/models/fleet/ComputeKind";

// A compute page as the report counts it: its kind and phase, the needs of each runnable item, and the blocker each
// Waiting item names
export interface GenshinArea {
  blockers: string[];
  kind: ComputeKind;
  needs: string[][];
  phase: number;
}
