import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { AreaTerrainType } from "#src/models/world/AreaTerrainType";
import { computeOutlineDistance } from "genshin-engine";

// Whether a place in an area stands in one of its cities: inside an outline of a subarea the game files as a city,
// Where rain stops at the edge however the area round it turns
export const checkIsInCity = ({ subareas }: CatalogueArea, x: number, z: number): boolean =>
  subareas.some(
    ({ areaTerrainType, outlines }) =>
      areaTerrainType === AreaTerrainType.City &&
      outlines.some((outline) => computeOutlineDistance(outline, x, z) === 0),
  );
