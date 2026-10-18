import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";

// The Long-Term Encounter Points held in `majorVersion`: those earned in an earlier major version are reset with it, so none
// Are held
export const readLongTermEncounterPoints = (
  points: LongTermEncounterPoints,
  majorVersion: number,
): LongTermEncounterPoints => (points.majorVersion < majorVersion ? { halfPoints: 0, majorVersion } : points);
