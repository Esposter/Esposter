import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";

// Whether a capital's place stands inside a city area's extent, its edges included
const checkIsInExtent = ({ extent }: CityArea, { x, z }: GroundPoint): boolean =>
  x >= extent.minX && x <= extent.maxX && z >= extent.minZ && z <= extent.maxZ;
const getDistance = ({ centroid }: CityArea, place: GroundPoint): number =>
  Math.hypot(centroid.x - place.x, centroid.z - place.z);
// The area whose centroid stands nearest the place, or nothing where there are no areas
const selectNearest = (areas: readonly CityArea[], place: GroundPoint): CityArea | undefined =>
  areas.reduce<CityArea | undefined>(
    (nearest, area) => (!nearest || getDistance(area, place) < getDistance(nearest, place) ? area : nearest),
    undefined,
  );
// The city area a capital stands in: the one whose extent contains its place, the nearest centroid where several do.
// Failing that, the nearest centroid within the architecture radius, and no area beyond it
export const selectCapitalCityArea = (areas: readonly CityArea[], place: GroundPoint): CityArea | undefined => {
  const containing = areas.filter((area) => checkIsInExtent(area, place));
  if (containing.length > 0) return selectNearest(containing, place);
  const nearest = selectNearest(areas, place);
  return nearest && getDistance(nearest, place) <= ARCHITECTURE_VIEW_METRES ? nearest : undefined;
};
