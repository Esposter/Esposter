import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";

import { TERRAIN_HEIGHT_PADDING } from "#src/terrain/constants";
import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";

// The rectangle a tile's heights are read over (`computeTerrainTile`): its square and the vertices its normals read past
// Every side, so a ground that changes no height inside it changes nothing the tile is built from
export const getTerrainTileBounds = (key: number, finestTileSize: number, cellsPerSide: number): TerrainBounds => {
  const size = finestTileSize * 2 ** getTerrainTileLevel(key);
  const padding = (TERRAIN_HEIGHT_PADDING * size) / cellsPerSide;
  const minX = getTerrainTileColumn(key) * size - padding;
  const minZ = getTerrainTileRow(key) * size - padding;
  return { maxX: minX + size + 2 * padding, maxZ: minZ + size + 2 * padding, minX, minZ };
};
