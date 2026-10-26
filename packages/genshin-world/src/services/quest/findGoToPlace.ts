import type { GoToPlace } from "#src/models/world/GoToPlace";
import type { RegionData } from "#src/models/world/RegionData";

// The go-to place a target id names, among the regions in reach
export const findGoToPlace = (
  regionDataMap: ReadonlyMap<string, RegionData>,
  targetId: string,
): GoToPlace | undefined =>
  [...regionDataMap.values()].flatMap(({ goToPlaces }) => goToPlaces).find(({ id }) => id === targetId);
