import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";

// The scene points of the statues among the unlocked landmark ids, the points an expedition's condition may name
export const computeUnlockedStatuePointIds = (unlockedLandmarkIds: ReadonlySet<string>): ReadonlySet<number> =>
  new Set(
    [...unlockedLandmarkIds].flatMap((landmarkId) => {
      const statuePointId = LandmarkIdStatuePointIdMap[landmarkId];
      return statuePointId === undefined ? [] : [statuePointId];
    }),
  );
