import type { TerrainResidualFade } from "#src/models/terrain/TerrainResidualFade";

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
  const left = Math.floor(column);
  const near = Math.floor(row);
  const right = Math.min(left + 1, sizeX - 1);
  const far = Math.min(near + 1, sizeZ - 1);
  const across = column - left;
  const along = row - near;
  let weight =
    ((weights[near * sizeX + left] ?? 0) * (1 - across) + (weights[near * sizeX + right] ?? 0) * across) * (1 - along) +
    ((weights[far * sizeX + left] ?? 0) * (1 - across) + (weights[far * sizeX + right] ?? 0) * across) * along;
  for (const { falloff, radius, x: centreX, z: centreZ } of clearings)
    weight *= MathUtils.smoothstep(Math.hypot(x - centreX, z - centreZ), radius, radius + falloff);
  return weight;
};
