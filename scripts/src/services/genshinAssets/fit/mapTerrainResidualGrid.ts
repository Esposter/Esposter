import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

// A grid of the same samples holding a value read at each: the sample's place in the world's axes and the grid's own
// Value there
export const mapTerrainResidualGrid = (
  grid: TerrainResidualGrid,
  getValue: (x: number, z: number, value: number) => number,
): TerrainResidualGrid => {
  const { originX, originZ, size, step, values } = grid;
  return {
    ...grid,
    values: values.map((value, index) =>
      getValue(originX + (index % size) * step, originZ + Math.floor(index / size) * step, value),
    ),
  };
};
