import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The doings of an area the player has done. An area's waypoint is its statue, a Statue of The Seven or a Statue of the New
// Moon, so it is done once that statue is unlocked; every other doing is done once the save records it, by its id: a chest
// Opened, a camp cleared, an Oculus found or a puzzle solved
export const computeExploredDoingIds = (
  { areaId, doings }: ExplorationArea,
  unlockedLandmarks: readonly PlaceLandmark[],
  recordedDoingIds: ReadonlySet<string>,
): ReadonlySet<string> => {
  const isStatueUnlocked = unlockedLandmarks.some(
    ({ areaId: landmarkAreaId, kind }) =>
      landmarkAreaId === areaId && (kind === LandmarkKind.StatueOfTheSeven || kind === LandmarkKind.StatueOfTheNewMoon),
  );
  return new Set(
    doings
      .filter(({ id, kind }) => (kind === ExplorationKind.Waypoint ? isStatueUnlocked : recordedDoingIds.has(id)))
      .map(({ id }) => id),
  );
};
