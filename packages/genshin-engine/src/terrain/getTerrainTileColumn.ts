import { TILE_INDEX_OFFSET, TILE_INDEX_SPAN } from "#src/terrain/constants";

export const getTerrainTileColumn = (key: number): number => (key % TILE_INDEX_SPAN) - TILE_INDEX_OFFSET;
