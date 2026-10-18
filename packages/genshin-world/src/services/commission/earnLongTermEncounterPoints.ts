import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";

import { readLongTermEncounterPoints } from "#src/services/commission/readLongTermEncounterPoints";

// The Long-Term Encounter Points with `halfPoints` added to those held in `majorVersion`, which are kept from here on
export const earnLongTermEncounterPoints = (
  points: LongTermEncounterPoints,
  halfPoints: number,
  majorVersion: number,
): LongTermEncounterPoints => ({
  halfPoints: readLongTermEncounterPoints(points, majorVersion).halfPoints + halfPoints,
  majorVersion,
});
