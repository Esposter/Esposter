import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";

// The tile one level coarser that covers this one: a coarser tile is twice the side, so its column and row are
// Halved, rounding toward negative infinity
export const getParentTerrainTileKey = (key: number): number => {
  const level = getTerrainTileLevel(key);
  const column = getTerrainTileColumn(key);
  const row = getTerrainTileRow(key);
  return getTerrainTileKey(level + 1, Math.floor(column / 2), Math.floor(row / 2));
};
