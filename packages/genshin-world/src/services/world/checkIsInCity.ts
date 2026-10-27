import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { findCityAt } from "#src/services/world/findCityAt";

// Whether a place in an area stands in one of its cities: inside an outline of a subarea the game files as a city,
// Where rain stops at the edge however the area round it turns
export const checkIsInCity = (area: CatalogueArea, x: number, z: number): boolean =>
  findCityAt(area, x, z) !== undefined;
