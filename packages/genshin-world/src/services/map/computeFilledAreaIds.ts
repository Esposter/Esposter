import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";

// The catalogue areas the map has filled in: each one an unlocked landmark stands in. A Statue of The Seven
// Resonated with fills its own area, so an area stays blank on the map until a landmark in it is unlocked
export const computeFilledAreaIds = (unlockedLandmarks: readonly PlaceLandmark[]): ReadonlySet<string> =>
  new Set(unlockedLandmarks.map(({ areaId }) => areaId));
