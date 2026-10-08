import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Landmark } from "#src/models/world/Landmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The doings of an area the player has done. An area's waypoint is its Statue of The Seven, so it is done once that
// Statue is unlocked; a chest or a camp has no record in the world yet, so none is done
export const computeExploredDoingIds = (
  { areaId, doings }: ExplorationArea,
  unlockedLandmarks: readonly Landmark[],
): ReadonlySet<string> => {
  const isStatueUnlocked = unlockedLandmarks.some(
    ({ areaId: landmarkAreaId, kind }) => landmarkAreaId === areaId && kind === LandmarkKind.StatueOfTheSeven,
  );
  if (!isStatueUnlocked) return new Set();
  return new Set(doings.filter(({ kind }) => kind === ExplorationKind.Waypoint).map(({ id }) => id));
};
