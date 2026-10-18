import type { EncounterPoints } from "#src/models/commission/EncounterPoints";

// The Encounter Points held after earning `halfPoints` more, up to the storage. Points already held stay when the storage
// Has since shrunk below them, and what the storage has no room for is not held (the long-term points keep it)
export const earnEncounterPoints = (points: EncounterPoints, halfPoints: number, storage: number): EncounterPoints => ({
  ...points,
  halfPoints: Math.max(points.halfPoints, Math.min(points.halfPoints + halfPoints, storage)),
});
