import type { TerrainTile } from "#src/models/terrain/TerrainTile";
import type { TerrainTileArrays } from "#src/models/terrain/TerrainTileArrays";

import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";

// The arrays of a ring's tiles laid end to end, each tile's positions and coarse positions moved to its place in the
// Scene, so the ring draws as one mesh over one index. A tile's vertices are numbered from its ordinal in the ring times
// The vertices a tile has, every tile of a level sharing one grid. A coarse position's level rides along unchanged
export const mergeTerrainTiles = (tiles: readonly TerrainTile[], finestTileSize: number): TerrainTileArrays => {
  const vertexCount = tiles.reduce((count, { positions }) => count + positions.length / 3, 0);
  const coarseColors = new Float32Array(vertexCount * 3);
  const coarseNormals = new Float32Array(vertexCount * 3);
  const coarsePositions = new Float32Array(vertexCount * 4);
  const colors = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const positions = new Float32Array(vertexCount * 3);
  let base = 0;
  for (const tile of tiles) {
    const size = finestTileSize * 2 ** getTerrainTileLevel(tile.key);
    // Each axis of a position moved by the tile's corner, the height axis not at all
    const offsetX = getTerrainTileColumn(tile.key) * size;
    const offsetZ = getTerrainTileRow(tile.key) * size;
    const offsets3 = [offsetX, 0, offsetZ];
    const offsets4 = [offsetX, 0, offsetZ, 0];
    const tileVertexCount = tile.positions.length / 3;
    for (let vertex = 0; vertex < tileVertexCount; vertex++) {
      const merged3 = (base + vertex) * 3;
      const merged4 = (base + vertex) * 4;
      const tile3 = vertex * 3;
      const tile4 = vertex * 4;
      for (let axis = 0; axis < 3; axis++) {
        colors[merged3 + axis] = tile.colors[tile3 + axis] ?? 0;
        coarseColors[merged3 + axis] = tile.coarseColors[tile3 + axis] ?? 0;
        normals[merged3 + axis] = tile.normals[tile3 + axis] ?? 0;
        coarseNormals[merged3 + axis] = tile.coarseNormals[tile3 + axis] ?? 0;
        positions[merged3 + axis] = (tile.positions[tile3 + axis] ?? 0) + (offsets3[axis] ?? 0);
      }
      for (let axis = 0; axis < 4; axis++)
        coarsePositions[merged4 + axis] = (tile.coarsePositions[tile4 + axis] ?? 0) + (offsets4[axis] ?? 0);
    }
    base += tileVertexCount;
  }
  return { coarseColors, coarseNormals, coarsePositions, colors, normals, positions };
};
