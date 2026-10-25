import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

import { getDistance } from "#src/services/genshinAssets/world/getDistance";

// The area whose centroid stands nearest the place, or nothing where there are no areas
export const selectNearest = (areas: readonly CityArea[], place: GroundPoint): CityArea | undefined =>
  areas.reduce<CityArea | undefined>(
    (nearest, area) => (!nearest || getDistance(area, place) < getDistance(nearest, place) ? area : nearest),
    undefined,
  );
