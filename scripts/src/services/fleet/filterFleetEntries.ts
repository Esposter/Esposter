import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";

// The entries a runner may take: those on its lane and of its kind. An empty lane matches every entry, an omitted kind
// Too, and a unit has no lane, so it is offered only when no lane is named
export const filterFleetEntries = (
  entries: readonly FleetEntry[],
  lane: string,
  kind: FleetEntryKind | undefined,
): FleetEntry[] =>
  entries.filter((entry) => (lane === "" || entry.lane === lane) && (kind === undefined || entry.kind === kind));
