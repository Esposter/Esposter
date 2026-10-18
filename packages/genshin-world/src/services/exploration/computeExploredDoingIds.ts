import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Landmark } from "#src/models/world/Landmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The doings of an area the player has done. An area's waypoint is its Statue of The Seven, so it is done once that
// Statue is unlocked. Provisional: a chest's doing names no chest, so the area's opened chests take its chest doings in
// The order the table gives them, the first as many as were opened, which counts how many are done and not which. A camp
// Has no record in the world yet, so none is done
export const computeExploredDoingIds = (
  { areaId, doings }: ExplorationArea,
  unlockedLandmarks: readonly Landmark[],
  openedChestCount = 0,
): ReadonlySet<string> => {
  const isStatueUnlocked = unlockedLandmarks.some(
    ({ areaId: landmarkAreaId, kind }) => landmarkAreaId === areaId && kind === LandmarkKind.StatueOfTheSeven,
  );
  const waypointIds = isStatueUnlocked
    ? doings.filter(({ kind }) => kind === ExplorationKind.Waypoint).map(({ id }) => id)
    : [];
  const chestIds = doings
    .filter(({ kind }) => kind === ExplorationKind.Chest)
    .slice(0, openedChestCount)
    .map(({ id }) => id);
  return new Set([...waypointIds, ...chestIds]);
};
