import type { ComputeKind } from "#src/models/fleet/ComputeKind";
import type { FleetEntry } from "#src/models/fleet/FleetEntry";

// A compute page as the fleet reads it: its kind and phase from the index, and its runnable and waiting items
export interface ComputeArea {
  kind: ComputeKind;
  phase: number;
  queue: FleetEntry[];
  skipped: number;
  waiting: FleetEntry[];
}
