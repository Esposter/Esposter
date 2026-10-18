import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";

// The regions whose statue is among the unlocked landmarks, in the order those landmarks were unlocked. A statue is
// Unlocked by its resonance, so these are the regions the Traveler has resonated with
export const getResonatedRegionIds = (unlockedLandmarkIds: Iterable<string>): string[] =>
  [...unlockedLandmarkIds].flatMap((landmarkId) => {
    const regionId = getStatueRegionId(landmarkId);
    return regionId === undefined ? [] : [regionId];
  });
