import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { getHomeAreaPlacements } from "#src/services/home/getHomeAreaPlacements";
import { getHomeFurnishingLimit } from "#src/services/home/getHomeFurnishingLimit";

// The realm's placements with `placement` added, kept only while its area holds no more furnishings than the area's count
// And its load stays within the area's limit. Undefined where the area or the furnishing is not one the game holds, or where
// Either would pass its limit, and nothing is placed then
export const placeHomeFurnishing = (
  placements: HomePlacement[],
  placement: HomePlacement,
  { areas, furnishings }: { areas: HomeArea[]; furnishings: HomeFurnishing[] },
): HomePlacement[] | undefined => {
  const area = areas.find(({ areaId, sceneId }) => areaId === placement.areaId && sceneId === placement.sceneId);
  const itemIdFurnishingMap = new Map(furnishings.map((furnishing) => [furnishing.itemId, furnishing]));
  if (area === undefined || !itemIdFurnishingMap.has(placement.furnishingItemId)) return undefined;
  const areaPlacements = [...getHomeAreaPlacements(placements, placement), placement];
  return getHomeFurnishingLimit(areaPlacements, area, itemIdFurnishingMap) === undefined
    ? [...placements, placement]
    : undefined;
};
