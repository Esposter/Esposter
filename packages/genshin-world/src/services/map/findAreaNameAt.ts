import type { Catalogue } from "#src/models/world/Catalogue";

import { findAreaAt } from "#src/services/map/findAreaAt";
import { findCityAt } from "#src/services/world/findCityAt";

// The name the map shows for the place a point stands in: the city it stands in where the game names one, and otherwise
// The area it stands in, so a place in Windrise shows Galesong Hill, the area the game files it under. None where no
// Area's outline holds the point
export const findAreaNameAt = (catalogue: Catalogue, x: number, z: number): string | undefined => {
  const area = findAreaAt(catalogue, x, z);
  return area && (findCityAt(area, x, z)?.name ?? area.name);
};
