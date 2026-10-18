import type { EncounterPoints } from "#src/models/commission/EncounterPoints";

// The half points of an earn that the storage turns away, which are kept as Long-Term Encounter Points: the storage takes the
// Earn up to its limit and no further, and a balance held past a storage that has since shrunk stays held without taking more
export const computeEncounterPointOverflow = (points: EncounterPoints, halfPoints: number, storage: number): number => {
  const held = points.halfPoints;
  return held + halfPoints - Math.max(held, Math.min(held + halfPoints, storage));
};
