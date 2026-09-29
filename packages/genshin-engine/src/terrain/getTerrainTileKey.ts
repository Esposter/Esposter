import { TILE_INDEX_OFFSET, TILE_INDEX_SPAN } from "#src/terrain/constants";

// A tile's level, column and row packed into one number, so a cache is keyed without building a string
export const getTerrainTileKey = (level: number, column: number, row: number): number =>
  (level * TILE_INDEX_SPAN + row + TILE_INDEX_OFFSET) * TILE_INDEX_SPAN + column + TILE_INDEX_OFFSET;
