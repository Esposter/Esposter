import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

// The realm's placements with `placement` added, kept only while the load its area holds stays within the area's limit
// Undefined where the area or the furnishing is not one the game holds, or where the load would pass the limit, and
// Nothing is placed then. A stored placement whose furnishing the table no longer holds counts nothing
export const placeHomeFurnishing = (
  placements: HomePlacement[],
  placement: HomePlacement,
  { areas, furnishings }: { areas: HomeArea[]; furnishings: HomeFurnishing[] },
): HomePlacement[] | undefined => {
  const area = areas.find(({ areaId, sceneId }) => areaId === placement.areaId && sceneId === placement.sceneId);
  const loadMap = new Map(furnishings.map(({ itemId, load }) => [itemId, load]));
  const placedLoad = loadMap.get(placement.furnishingItemId);
  if (area === undefined || placedLoad === undefined) return undefined;
  const areaLoad = placements
    .filter(({ areaId, sceneId }) => areaId === placement.areaId && sceneId === placement.sceneId)
    .reduce((total, { furnishingItemId }) => total + (loadMap.get(furnishingItemId) ?? 0), 0);
  return areaLoad + placedLoad > area.loadLimit ? undefined : [...placements, placement];
};
