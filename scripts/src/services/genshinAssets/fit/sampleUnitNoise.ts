import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { RESIDUAL_OCTAVES, RESIDUAL_SEED } from "#src/services/genshinAssets/fit/constants";
import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";
import { createResidualHeight } from "genshin-engine";

// The noise a scale draws with the amplitude of one metre at each of the grid's samples, weighted as they are
export const sampleUnitNoise = (
  grid: TerrainResidualGrid,
  scale: number,
  getWeight: (x: number, z: number) => number,
): TerrainResidualGrid => {
  const getNoise = createResidualHeight({ amplitude: 1, octaves: RESIDUAL_OCTAVES, scale, seed: RESIDUAL_SEED });
  return mapTerrainResidualGrid(grid, (x, z, value) =>
    Number.isFinite(value) ? getWeight(x, z) * getNoise(x, z) : Number.NaN,
  );
};
