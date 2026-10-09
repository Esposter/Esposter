// One unit of work the fleet may take: a compute-queue item or an open proposal unit. `touches` is the set of paths it
// Writes, which no live claim may overlap, and `needs` the capabilities a machine must hold to take it
export interface FleetEntry {
  area: string;
  id: string;
  needs: string[];
  touches: string[];
}
