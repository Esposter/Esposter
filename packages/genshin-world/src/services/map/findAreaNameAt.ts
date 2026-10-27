import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { findCityAt } from "#src/services/world/findCityAt";

// The name the map shows for the place a point stands in within its area: the city it stands in where the game names one,
// And otherwise the area itself, so a place in Windrise shows Galesong Hill, the area the game files it under
export const findAreaNameAt = (area: CatalogueArea, x: number, z: number): string =>
  findCityAt(area, x, z)?.name ?? area.name;
