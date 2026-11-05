import type { ComputeKind } from "#src/models/fleet/ComputeKind";

// A compute page's row in the Phases table: the kind of area it covers and the phase its items hold
export interface ComputePhase {
  kind: ComputeKind;
  phase: number;
}
