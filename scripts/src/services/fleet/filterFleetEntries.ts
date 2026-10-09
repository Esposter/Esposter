import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";

// Whether a value names a kind of entry, so a command's `--kind` is checked before it filters anything
export const checkIsFleetEntryKind = (value: string): value is FleetEntryKind =>
  Object.values(FleetEntryKind).some((kind) => kind === value);

// The entries a runner may take: those on its lane and of its kind. An empty lane or kind matches every entry, and a
// Unit has no lane, so it is offered only when no lane is named
export const filterFleetEntries = (entries: readonly FleetEntry[], lane: string, kind: string): FleetEntry[] =>
  entries.filter((entry) => (lane === "" || entry.lane === lane) && (kind === "" || entry.kind === kind));
