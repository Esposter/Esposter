import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { smoothTerrainGrid } from "#src/services/genshinAssets/fit/smoothTerrainGrid";

// A heightfield's detail finer than a scale: each sample taken less the Gaussian mean, at that sigma in metres, of the
// Samples taken round it, NaN where none is taken
export const computeTerrainDetail = (grid: TerrainResidualGrid, sigma: number): TerrainResidualGrid => {
  const smoothed = smoothTerrainGrid(grid, sigma).values;
  return { ...grid, values: grid.values.map((value, index) => value - (smoothed[index] ?? 0)) };
};
