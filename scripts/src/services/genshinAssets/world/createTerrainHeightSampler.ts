import type { TerrainHeights } from "#src/models/genshinAssets/world/TerrainHeights";

import { TERRAIN_TILE_SIZE } from "#src/services/genshinAssets/shared/constants";

// The ground's height at any x and z of the game's own axes over a set of terrain tiles, each at its column and row,
// Read between its four nearest samples; where no tile lies it is not a number
export const createTerrainHeightSampler = (
  tiles: readonly { column: number; row: number; terrainHeights: TerrainHeights }[],
): ((x: number, z: number) => number) => {
  const keyTileMap = new Map(tiles.map((tile) => [`${tile.column},${tile.row}`, tile.terrainHeights]));
  return (x, z) => {
    const column = Math.floor(x / TERRAIN_TILE_SIZE);
    const row = Math.floor(z / TERRAIN_TILE_SIZE);
    const terrainHeights = keyTileMap.get(`${column},${row}`);
    if (!terrainHeights) return Number.NaN;
    const { heights, resolution, spacing } = terrainHeights;
    const last = resolution - 1;
    const sampleColumn = Math.min((x - column * TERRAIN_TILE_SIZE) / spacing, last);
    const sampleRow = Math.min((z - row * TERRAIN_TILE_SIZE) / spacing, last);
    const left = Math.min(Math.floor(sampleColumn), last - 1);
    const bottom = Math.min(Math.floor(sampleRow), last - 1);
    const across = sampleColumn - left;
    const along = sampleRow - bottom;
    const read = (sampleRowIndex: number, sampleColumnIndex: number): number =>
      heights[sampleRowIndex * resolution + sampleColumnIndex] ?? 0;
    const near = read(bottom, left) * (1 - across) + read(bottom, left + 1) * across;
    const far = read(bottom + 1, left) * (1 - across) + read(bottom + 1, left + 1) * across;
    return near * (1 - along) + far * along;
  };
};
