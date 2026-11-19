import type { Versioned } from "#src/models/shared/overlay/Versioned";

// An arrival applies to a key nothing holds, or to a version above the one held. An equal or lower version is a late
// Read, a repeated event or a superseded response, and loses here, so no caller checks for it
export const checkIsNewerArrival = <TRow extends Versioned>(held: TRow | undefined, arrival: TRow): boolean =>
  held === undefined || arrival.version > held.version;
