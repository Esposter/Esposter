import type { GroundPoint } from "genshin-engine";

import { TERRAIN_TILE_SIZE } from "#src/services/genshinAssets/shared/constants";

// The tiles, by column and row, that the square of half side `reach` round a point touches: every tile from the one
// Holding the square's least corner to the one holding its greatest, a square edge on a tile's border taking that
// Border's far tile as well as the near one
export const getCoveredTiles = ({ x, z }: GroundPoint, reach: number): { column: number; row: number }[] => {
  const columnStart = Math.floor((x - reach) / TERRAIN_TILE_SIZE);
  const columnEnd = Math.floor((x + reach) / TERRAIN_TILE_SIZE);
  const rowStart = Math.floor((z - reach) / TERRAIN_TILE_SIZE);
  const rowEnd = Math.floor((z + reach) / TERRAIN_TILE_SIZE);
  return Array.from({ length: columnEnd - columnStart + 1 }, (_value, columnOffset) =>
    Array.from({ length: rowEnd - rowStart + 1 }, (_rowValue, rowOffset) => ({
      column: columnStart + columnOffset,
      row: rowStart + rowOffset,
    })),
  ).flat();
};
