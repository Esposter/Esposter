import type { TerrainTile } from "#src/terrain/TerrainTile";
import type { TerrainTileOptions } from "#src/terrain/TerrainTileOptions";

import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";

// A tile's grid sampled from the region's heights. Heights are read once each into a buffer one vertex wider than
// The tile on every side, so every normal is taken from its neighbours by central differences, the edge's included,
// And a tile's edge normal matches its neighbour's. A vertex's coarse position is the even vertex it collapses onto
// On the next level's grid, so the fully morphed tile is exactly that level's surface
export const computeTerrainTile = ({
  cellsPerSide,
  finestTileSize,
  getHeight,
  key,
  writeColor,
}: TerrainTileOptions): TerrainTile => {
  const level = getTerrainTileLevel(key);
  const size = finestTileSize * 2 ** level;
  const step = size / cellsPerSide;
  const left = getTerrainTileColumn(key) * size;
  const back = getTerrainTileRow(key) * size;
  const side = cellsPerSide + 1;
  const paddedSide = side + 2;
  const heights = new Float32Array(paddedSide * paddedSide);
  for (let row = 0; row < paddedSide; row++)
    for (let column = 0; column < paddedSide; column++)
      heights[row * paddedSide + column] = getHeight(left + (column - 1) * step, back + (row - 1) * step);

  const vertexCount = side * side;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const coarsePositions = new Float32Array(vertexCount * 4);
  for (let row = 0; row < side; row++)
    for (let column = 0; column < side; column++) {
      const paddedIndex = (row + 1) * paddedSide + column + 1;
      const height = heights[paddedIndex] ?? 0;
      const normalX = (heights[paddedIndex - 1] ?? height) - (heights[paddedIndex + 1] ?? height);
      const normalY = 2 * step;
      const normalZ = (heights[paddedIndex - paddedSide] ?? height) - (heights[paddedIndex + paddedSide] ?? height);
      const length = Math.hypot(normalX, normalY, normalZ);
      const index = row * side + column;
      const offset = index * 3;
      const x = column * step;
      const z = row * step;
      positions[offset] = x;
      positions[offset + 1] = height;
      positions[offset + 2] = z;
      normals[offset] = normalX / length;
      normals[offset + 1] = normalY / length;
      normals[offset + 2] = normalZ / length;
      writeColor(colors, offset, height, 1 - normalY / length, left + x, back + z);
      const coarseColumn = column - (column % 2);
      const coarseRow = row - (row % 2);
      const coarseOffset = index * 4;
      coarsePositions[coarseOffset] = coarseColumn * step;
      coarsePositions[coarseOffset + 1] = heights[(coarseRow + 1) * paddedSide + coarseColumn + 1] ?? height;
      coarsePositions[coarseOffset + 2] = coarseRow * step;
      coarsePositions[coarseOffset + 3] = level;
    }

  return { coarsePositions, colors, key, normals, positions };
};
