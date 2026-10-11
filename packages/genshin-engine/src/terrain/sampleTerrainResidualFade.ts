import type { TerrainResidualFade } from "#src/models/terrain/TerrainResidualFade";

import { blendGridNodes } from "#src/terrain/blendGridNodes";
import { MathUtils } from "three";

// The share of the residual a fade draws at a point: blended bilinearly from the four nodes round it, faded in across
// Each clearing's falloff, and none outside the grid, where nothing was fitted
export const sampleTerrainResidualFade = (
  { cellSize, clearings, origin, size, weights }: TerrainResidualFade,
  x: number,
  z: number,
): number => {
  const sizeX = size[0] ?? 1;
  const sizeZ = size[1] ?? 1;
  const column = (x - (origin[0] ?? 0)) / cellSize;
  const row = (z - (origin[1] ?? 0)) / cellSize;
  if (column < 0 || row < 0 || column > sizeX - 1 || row > sizeZ - 1) return 0;
  let weight = blendGridNodes(weights, sizeX, sizeZ, column, row);
  for (const { falloff, radius, x: centreX, z: centreZ } of clearings)
    weight *= MathUtils.smoothstep(Math.hypot(x - centreX, z - centreZ), radius, radius + falloff);
  return weight;
};
