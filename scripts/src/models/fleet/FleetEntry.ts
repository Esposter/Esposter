import type { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";

// One unit of work the fleet may take: a compute-queue item or an open proposal unit. `touches` is the set of paths it
// Writes, which no live claim may overlap, and `needs` the capabilities a machine must hold to take it. `lane` is the
// Queue item's lane tag (`page`, `cpu`), empty for a unit, which has none. `waiting` is the blocker a unit names while it
// Cannot be built yet, empty when it can; a waiting entry is never taken
export interface FleetEntry {
  area: string;
  id: string;
  kind: FleetEntryKind;
  lane: string;
  needs: string[];
  touches: string[];
  waiting: string;
}
