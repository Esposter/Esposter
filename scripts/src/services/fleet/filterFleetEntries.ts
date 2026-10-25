import type { FleetEntry } from "#src/models/fleet/FleetEntry";

// The entries a runner may take: those on its lane and of its kind. An empty lane or kind matches every entry, and a
// Unit has no lane, so it is offered only when no lane is named
export const filterFleetEntries = (entries: readonly FleetEntry[], lane: string, kind: string): FleetEntry[] =>
  entries.filter((entry) => (lane === "" || entry.lane === lane) && (kind === "" || entry.kind === kind));
