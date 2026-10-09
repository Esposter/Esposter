import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { TerrainResidualFade } from "genshin-engine";
import type { Except } from "type-fest";

import { computeRootMeanSquare } from "#src/services/genshinAssets/fit/computeRootMeanSquare";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { MathUtils } from "three";

// Where a residual is drawn: on nodes a cell apart, centred on the grid's middle and covering all of it, each weighing
// Smoothstep from the gate to twice the gate of the root-mean-square of the grid's values in its cell, so the residual
// Fades out where the ground above it already holds. A cell with no value weighs one, and the weights are then averaged
// Once over each node's three by three, so the fade's edges are soft. The places it is cleared from are the caller's
export const fitTerrainResidualFade = (
  { originX, originZ, size, step, values }: TerrainResidualGrid,
  cellSize: number,
  gate: number,
): Except<TerrainResidualFade, "clearings"> => {
  const halfExtent = ((size - 1) * step) / 2;
  const reach = Math.ceil(halfExtent / cellSize);
  const nodes = 2 * reach + 1;
  const fadeOriginX = originX + halfExtent - reach * cellSize;
  const fadeOriginZ = originZ + halfExtent - reach * cellSize;
  const cellValues = Array.from({ length: nodes * nodes }, (): number[] => []);
  for (const [index, value] of values.entries()) {
    const column = Math.round((originX + (index % size) * step - fadeOriginX) / cellSize);
    const row = Math.round((originZ + Math.floor(index / size) * step - fadeOriginZ) / cellSize);
    if (Number.isFinite(value)) cellValues[row * nodes + column]?.push(value);
  }
  const gated = cellValues.map((cell) =>
    cell.length === 0 ? 1 : MathUtils.smoothstep(computeRootMeanSquare(cell), gate, 2 * gate),
  );
  const weights = gated.map((_weight, node) => {
    const column = node % nodes;
    const row = Math.floor(node / nodes);
    let sum = 0;
    let count = 0;
    for (let neighbourRow = Math.max(0, row - 1); neighbourRow <= Math.min(nodes - 1, row + 1); neighbourRow++)
      for (
        let neighbourColumn = Math.max(0, column - 1);
        neighbourColumn <= Math.min(nodes - 1, column + 1);
        neighbourColumn++
      ) {
        sum += gated[neighbourRow * nodes + neighbourColumn] ?? 1;
        count++;
      }
    return roundFitted(sum / count);
  });
  return { cellSize, origin: [fadeOriginX, fadeOriginZ], size: [nodes, nodes], weights };
};
