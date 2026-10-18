import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { HOME_EXTERIOR_FURNISHING_LIMIT, HOME_INTERIOR_FURNISHING_LIMIT } from "#src/services/home/constants";

// The load the placements in one area hold: the first copy of a furnishing takes its load and each further copy its reduced
// Load. A stored placement whose furnishing the table no longer holds counts nothing
const getAreaLoad = (placements: HomePlacement[], furnishingMap: Map<number, HomeFurnishing>): number => {
  const copyCounts = new Map<number, number>();
  return placements.reduce((total, { furnishingItemId }) => {
    const furnishing = furnishingMap.get(furnishingItemId);
    if (furnishing === undefined) return total;
    const copyCount = copyCounts.get(furnishingItemId) ?? 0;
    copyCounts.set(furnishingItemId, copyCount + 1);
    return total + (copyCount === 0 ? furnishing.load : furnishing.discountLoad);
  }, 0);
};

// The realm's placements with `placement` added, kept only while its area holds no more furnishings than the area's count
// And its load stays within the area's limit. Undefined where the area or the furnishing is not one the game holds, or where
// Either would pass its limit, and nothing is placed then
export const placeHomeFurnishing = (
  placements: HomePlacement[],
  placement: HomePlacement,
  { areas, furnishings }: { areas: HomeArea[]; furnishings: HomeFurnishing[] },
): HomePlacement[] | undefined => {
  const area = areas.find(({ areaId, sceneId }) => areaId === placement.areaId && sceneId === placement.sceneId);
  const furnishingMap = new Map(furnishings.map((furnishing) => [furnishing.itemId, furnishing]));
  if (area === undefined || !furnishingMap.has(placement.furnishingItemId)) return undefined;
  const areaPlacements = [
    ...placements.filter(({ areaId, sceneId }) => areaId === placement.areaId && sceneId === placement.sceneId),
    placement,
  ];
  const furnishingLimit = area.exterior ? HOME_EXTERIOR_FURNISHING_LIMIT : HOME_INTERIOR_FURNISHING_LIMIT;
  const isWithinLimits =
    areaPlacements.length <= furnishingLimit && getAreaLoad(areaPlacements, furnishingMap) <= area.loadLimit;
  return isWithinLimits ? [...placements, placement] : undefined;
};
