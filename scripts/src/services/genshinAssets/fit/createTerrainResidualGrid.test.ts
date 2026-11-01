import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { describe } from "vitest";

// A square residual grid of `size` cells a side, each `step` metres from the next and the grid's `origin` in both axes,
// Each cell's value read from `getValue` at its position
export const createTerrainResidualGrid = (
  getValue: (x: number, z: number) => number,
  { origin, size, step }: { origin: number; size: number; step: number },
): TerrainResidualGrid => {
  const values = new Float64Array(size * size);
  for (let row = 0; row < size; row++)
    for (let column = 0; column < size; column++)
      values[row * size + column] = getValue(origin + column * step, origin + row * step);
  return { originX: origin, originZ: origin, size, step, values };
};

describe.todo("createTerrainResidualGrid");
