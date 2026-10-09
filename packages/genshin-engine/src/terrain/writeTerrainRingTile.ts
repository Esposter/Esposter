import type { TerrainTile } from "#src/models/terrain/TerrainTile";
import type { TerrainTileArrays } from "#src/models/terrain/TerrainTileArrays";

import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";

// Writes a tile's arrays into a ring's from the vertex `base` on, its positions and coarse positions moved to its place
// In the scene, so every tile of the ring draws as one mesh over one index. A coarse position's level rides along
// Unchanged, and the normals and colours are copied as they are
export const writeTerrainRingTile = (
  ring: TerrainTileArrays,
  base: number,
  tile: TerrainTile,
  finestTileSize: number,
): void => {
  const size = finestTileSize * 2 ** getTerrainTileLevel(tile.key);
  const offsetX = getTerrainTileColumn(tile.key) * size;
  const offsetZ = getTerrainTileRow(tile.key) * size;
  ring.colors.set(tile.colors, base * 3);
  ring.coarseColors.set(tile.coarseColors, base * 3);
  ring.normals.set(tile.normals, base * 3);
  ring.coarseNormals.set(tile.coarseNormals, base * 3);
  const tileVertexCount = tile.positions.length / 3;
  for (let vertex = 0; vertex < tileVertexCount; vertex++) {
    const ring3 = (base + vertex) * 3;
    const ring4 = (base + vertex) * 4;
    const tile3 = vertex * 3;
    const tile4 = vertex * 4;
    ring.positions[ring3] = (tile.positions[tile3] ?? 0) + offsetX;
    ring.positions[ring3 + 1] = tile.positions[tile3 + 1] ?? 0;
    ring.positions[ring3 + 2] = (tile.positions[tile3 + 2] ?? 0) + offsetZ;
    ring.coarsePositions[ring4] = (tile.coarsePositions[tile4] ?? 0) + offsetX;
    ring.coarsePositions[ring4 + 1] = tile.coarsePositions[tile4 + 1] ?? 0;
    ring.coarsePositions[ring4 + 2] = (tile.coarsePositions[tile4 + 2] ?? 0) + offsetZ;
    ring.coarsePositions[ring4 + 3] = tile.coarsePositions[tile4 + 3] ?? 0;
  }
};
