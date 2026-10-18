import type { StatueProgressSave } from "#src/models/statue/StatueProgressSave";

import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";
import { RegionIdStatueLandmarkIdMap } from "#src/services/statue/RegionIdStatueLandmarkIdMap";

// The scene points of the Statues of The Seven the save has resonated with, the points an expedition's condition may
// Name. A region is resonated once it holds a level, and its statue is the landmark its map names
export const computeUnlockedStatuePointIds = (regions: StatueProgressSave["regions"]): ReadonlySet<number> =>
  new Set(
    Object.entries(regions).flatMap(([regionId, { level }]) => {
      const landmarkId = RegionIdStatueLandmarkIdMap[regionId];
      const statuePointId = landmarkId === undefined ? undefined : LandmarkIdStatuePointIdMap[landmarkId];
      return level === 0 || statuePointId === undefined ? [] : [statuePointId];
    }),
  );
