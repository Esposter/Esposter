import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { HomeFurnishingLimit } from "#src/models/home/HomeFurnishingLimit";
import { computeHomeAreaLoad } from "#src/services/home/computeHomeAreaLoad";
import { HOME_EXTERIOR_FURNISHING_LIMIT, HOME_INTERIOR_FURNISHING_LIMIT } from "#src/services/home/constants";

// The limit the area's placements pass, its count first and then its load, or undefined while both hold. The placements are
// The area's own, with the candidate among them
export const getHomeFurnishingLimit = (
  areaPlacements: HomePlacement[],
  area: HomeArea,
  itemIdFurnishingMap: Map<number, HomeFurnishing>,
): HomeFurnishingLimit | undefined => {
  const furnishingLimit = area.exterior ? HOME_EXTERIOR_FURNISHING_LIMIT : HOME_INTERIOR_FURNISHING_LIMIT;
  if (areaPlacements.length > furnishingLimit) return HomeFurnishingLimit.Count;
  if (computeHomeAreaLoad(areaPlacements, itemIdFurnishingMap) > area.loadLimit) return HomeFurnishingLimit.Load;
  return undefined;
};
