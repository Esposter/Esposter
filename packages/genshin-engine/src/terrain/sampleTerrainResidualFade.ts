import type { TerrainResidualFade } from "#src/models/terrain/TerrainResidualFade";

// The share of the residual a fade draws at a point: blended bilinearly from the four nodes round it, and the whole
// Residual outside the grid
export const sampleTerrainResidualFade = (
  { cellSize, origin, size, weights }: TerrainResidualFade,
  x: number,
  z: number,
): number => {
  const sizeX = size[0] ?? 1;
  const sizeZ = size[1] ?? 1;
  const column = (x - (origin[0] ?? 0)) / cellSize;
  const row = (z - (origin[1] ?? 0)) / cellSize;
  if (column < 0 || row < 0 || column > sizeX - 1 || row > sizeZ - 1) return 1;
  const left = Math.floor(column);
  const near = Math.floor(row);
  const right = Math.min(left + 1, sizeX - 1);
  const far = Math.min(near + 1, sizeZ - 1);
  const across = column - left;
  const along = row - near;
  return (
    ((weights[near * sizeX + left] ?? 1) * (1 - across) + (weights[near * sizeX + right] ?? 1) * across) * (1 - along) +
    ((weights[far * sizeX + left] ?? 1) * (1 - across) + (weights[far * sizeX + right] ?? 1) * across) * along
  );
};
