import type { CatalogueArea } from "#src/models/world/CatalogueArea";
import type { CatalogueSubarea } from "#src/models/world/CatalogueSubarea";

import { AreaTerrainType } from "#src/models/world/AreaTerrainType";
import { computeOutlineDistance } from "genshin-engine";

// The city a place in an area stands in: the first subarea the game files as a city whose outline holds it, and none
// Where no city's outline does
export const findCityAt = ({ subareas }: CatalogueArea, x: number, z: number): CatalogueSubarea | undefined =>
  subareas.find(
    ({ areaTerrainType, outlines }) =>
      areaTerrainType === AreaTerrainType.City &&
      outlines.some((outline) => computeOutlineDistance(outline, x, z) === 0),
  );
