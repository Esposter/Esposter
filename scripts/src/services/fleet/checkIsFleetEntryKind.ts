import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";

// Whether a value names a kind of entry, so a command's `--kind` is checked before it filters anything
export const checkIsFleetEntryKind = (value: string): value is FleetEntryKind =>
  Object.values(FleetEntryKind).some((kind) => kind === value);
