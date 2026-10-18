import { RegionIdStatueLandmarkIdMap } from "#src/services/statue/RegionIdStatueLandmarkIdMap";

// The region whose Statue of The Seven a landmark is, if it is one
export const getStatueRegionId = (landmarkId: string): string | undefined =>
  Object.keys(RegionIdStatueLandmarkIdMap).find((regionId) => RegionIdStatueLandmarkIdMap[regionId] === landmarkId);
