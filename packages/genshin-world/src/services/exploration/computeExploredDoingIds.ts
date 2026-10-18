import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Landmark } from "#src/models/world/Landmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The doings of an area the player has done. An area's waypoint is its Statue of The Seven, so it is done once that
// Statue is unlocked; every other doing is done once the save records it, by its id: a chest opened, a camp cleared, an
// Oculus found or a puzzle solved
export const computeExploredDoingIds = (
  { areaId, doings }: ExplorationArea,
  unlockedLandmarks: readonly Landmark[],
  recordedDoingIds: ReadonlySet<string>,
): ReadonlySet<string> => {
  const isStatueUnlocked = unlockedLandmarks.some(
    ({ areaId: landmarkAreaId, kind }) => landmarkAreaId === areaId && kind === LandmarkKind.StatueOfTheSeven,
  );
  return new Set(
    doings
      .filter(({ id, kind }) => (kind === ExplorationKind.Waypoint ? isStatueUnlocked : recordedDoingIds.has(id)))
      .map(({ id }) => id),
  );
};
