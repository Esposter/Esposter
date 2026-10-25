import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

import { checkIsInExtent } from "#src/services/genshinAssets/world/checkIsInExtent";
import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";
import { getDistance } from "#src/services/genshinAssets/world/getDistance";
import { selectNearest } from "#src/services/genshinAssets/world/selectNearest";

// The city area a capital stands in: the one whose extent contains its place, the nearest centroid where several do.
// Failing that, the nearest centroid within the architecture radius, and no area beyond it
export const selectCapitalCityArea = (areas: readonly CityArea[], place: GroundPoint): CityArea | undefined => {
  const containing = areas.filter((area) => checkIsInExtent(area, place));
  if (containing.length > 0) return selectNearest(containing, place);
  const nearest = selectNearest(areas, place);
  return nearest && getDistance(nearest, place) <= ARCHITECTURE_VIEW_METRES ? nearest : undefined;
};
