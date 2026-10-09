import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { computeRootMeanSquare } from "#src/services/genshinAssets/fit/computeRootMeanSquare";

// How much a grid's values change over a lag, its power at that scale: the root-mean-square difference between every
// Two samples the lag apart along either axis, the lag taken to the nearest whole step and at least one
export const computeLagDifference = ({ size, step, values }: TerrainResidualGrid, lag: number): number => {
  const lagSteps = Math.max(1, Math.round(lag / step));
  const differences: number[] = [];
  for (const [index, value] of values.entries()) {
    const column = index % size;
    const row = Math.floor(index / size);
    if (column + lagSteps < size) differences.push(value - (values[index + lagSteps] ?? Number.NaN));
    if (row + lagSteps < size) differences.push(value - (values[index + lagSteps * size] ?? Number.NaN));
  }
  return computeRootMeanSquare(differences);
};
