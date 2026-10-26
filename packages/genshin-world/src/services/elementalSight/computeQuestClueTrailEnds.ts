import type { RegionData } from "#src/models/world/RegionData";
import type { GroundPoint } from "genshin-engine";

// The ends the sight leads a trail to for the quests' clues: the go-to place each clue's target names, where the region
// Data places it. A clue whose place is not placed yet has none
export const computeQuestClueTrailEnds = (
  regionDataMap: ReadonlyMap<string, RegionData>,
  clueTargetIds: readonly string[],
): GroundPoint[] => {
  const goToPlaces = [...regionDataMap.values()].flatMap((regionData) => regionData.goToPlaces);
  return clueTargetIds.flatMap((clueTargetId) => {
    const goToPlace = goToPlaces.find(({ id }) => id === clueTargetId);
    return goToPlace ? [goToPlace.position] : [];
  });
};
