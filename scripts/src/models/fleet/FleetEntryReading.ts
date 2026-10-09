import type { FleetEntry } from "#src/models/fleet/FleetEntry";

// The entries read from the queue, and how many queue lines were skipped for having no id, so a missing id is counted
export interface FleetEntryReading {
  entries: FleetEntry[];
  skipped: number;
}
