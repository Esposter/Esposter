import { RegionId } from "#src/models/RegionId";
import { LandmarkIdStatuePointId } from "#src/models/statue/LandmarkIdStatuePointId";

// The landmark of each nation's Statue of The Seven, by its region's id in the save, whose scene point the landmark map
// Names. Only Mondstadt's region is in the region data so far
export const RegionIdStatueLandmarkIdMap: Readonly<Record<string, string>> = {
  [RegionId.Mondstadt]: LandmarkIdStatuePointId.WindriseStatueOfTheSeven,
};
