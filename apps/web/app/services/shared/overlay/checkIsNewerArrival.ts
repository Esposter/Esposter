import type { Versioned } from "#src/models/shared/overlay/Versioned";

// An arrival is newer when nothing holds its key, or its version is above the one held. An equal version is not newer,
// So the slot fills the held row with it instead, and a lower one is a late read, a repeated event or a superseded
// Response, which loses here, so no caller checks for it
export const checkIsNewerArrival = <TRow extends Versioned>(held: TRow | undefined, arrival: TRow): boolean =>
  held === undefined || arrival.version > held.version;
