import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { blurMasked } from "#src/services/shared/blurMasked";

// A heightfield smoothed at a scale: at each sample, the Gaussian mean, at that sigma in metres, of the samples taken
// Round it, a sample not taken weighing nothing, and 0 where none is taken within its reach
export const smoothTerrainGrid = (grid: TerrainResidualGrid, sigma: number): TerrainResidualGrid => {
  const { size, step, values } = grid;
  const mask = Uint8Array.from(values, (value) => (Number.isFinite(value) ? 1 : 0));
  const taken = Float32Array.from(values, (value) => (Number.isFinite(value) ? value : 0));
  return { ...grid, values: Float64Array.from(blurMasked(taken, mask, size, size, sigma / step)) };
};
