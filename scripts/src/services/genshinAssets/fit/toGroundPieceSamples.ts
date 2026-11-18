import type { GroundPieceSample } from "#src/models/genshinAssets/fit/GroundPieceSample";
import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

// The samples of a grid a piece's bar is read on: each finite value with its place, the grid's rows running along z
export const toGroundPieceSamples = (grid: TerrainResidualGrid): GroundPieceSample[] => {
  const samples: GroundPieceSample[] = [];
  for (const [index, height] of grid.values.entries())
    if (Number.isFinite(height))
      samples.push({
        height,
        x: grid.originX + (index % grid.size) * grid.step,
        z: grid.originZ + Math.floor(index / grid.size) * grid.step,
      });
  return samples;
};
