import type { FleetEntry } from "#src/models/fleet/FleetEntry";

// One compute page's items: its runnable entries, its waiting entries with the blocker each names in `waiting`, and how
// many open lines had no id, so a missing id is counted rather than lost
export interface ComputeQueueReading {
  entries: FleetEntry[];
  skipped: number;
  waiting: FleetEntry[];
}
