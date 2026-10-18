import { RegionIdStatueLandmarkIdMap } from "#src/services/statue/RegionIdStatueLandmarkIdMap";

// The regions whose statue is among the unlocked landmarks, in the order those landmarks were unlocked. A statue is
// Unlocked by its resonance, so these are the regions the Traveler has resonated with
export const getResonatedRegionIds = (unlockedLandmarkIds: Iterable<string>): string[] =>
  [...unlockedLandmarkIds].flatMap((landmarkId) => {
    const regionId = Object.keys(RegionIdStatueLandmarkIdMap).find(
      (id) => RegionIdStatueLandmarkIdMap[id] === landmarkId,
    );
    return regionId === undefined ? [] : [regionId];
  });
