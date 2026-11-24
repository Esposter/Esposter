import type { TerrainTile } from "#src/models/genshinAssets/world/TerrainTile";

import { TERRAIN_TILE_SIZE } from "#src/services/genshinAssets/shared/constants";

// The tiles, by column and row, that a box spanning the given game-axis extents touches.
// Every tile from the one holding the box's least corner to the one holding its greatest is included.
// An edge on a tile's border takes that border's far tile as well.
export const getBoxTiles = (xMin: number, xMax: number, zMin: number, zMax: number): TerrainTile[] => {
  const columnStart = Math.floor(xMin / TERRAIN_TILE_SIZE);
  const columnEnd = Math.floor(xMax / TERRAIN_TILE_SIZE);
  const rowStart = Math.floor(zMin / TERRAIN_TILE_SIZE);
  const rowEnd = Math.floor(zMax / TERRAIN_TILE_SIZE);
  return Array.from({ length: columnEnd - columnStart + 1 }, (_value, columnOffset) =>
    Array.from({ length: rowEnd - rowStart + 1 }, (_rowValue, rowOffset) => ({
      column: columnStart + columnOffset,
      row: rowStart + rowOffset,
    })),
  ).flat();
};
