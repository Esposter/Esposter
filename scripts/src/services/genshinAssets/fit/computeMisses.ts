import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";

// What a ground misses by at each sample of a grid, the fit's samples or the piece's own ground the bar is read on
export const computeMisses = (
  grid: TerrainResidualGrid,
  getGroundHeight: (x: number, z: number) => number,
): TerrainResidualGrid => mapTerrainResidualGrid(grid, (x, z, height) => height - getGroundHeight(x, z));
