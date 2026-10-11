import { FillKind } from "#src/models/fleet/FillKind";
import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";

// The lane and kind `claimNextFleetEntry` filters by for one kind of fill: a unit has no lane, and a lane is a queue item
export const getFillFilter = (fillKind: FillKind): { kind: string; lane: string } =>
  fillKind === FillKind.Unit ? { kind: FleetEntryKind.Unit, lane: "" } : { kind: "", lane: fillKind };
