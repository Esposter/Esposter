import type { FleetEntry } from "#src/models/fleet/FleetEntry";

// Two entries that both hold a phase compare by it, and two that hold none compare equal, so the listed order holds
export const comparePhases = (firstEntry: FleetEntry, secondEntry: FleetEntry): number =>
  Number(firstEntry.phase === undefined) - Number(secondEntry.phase === undefined) ||
  (firstEntry.phase ?? 0) - (secondEntry.phase ?? 0);
