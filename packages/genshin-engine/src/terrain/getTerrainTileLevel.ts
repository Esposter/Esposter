import { TILE_INDEX_SPAN } from "#src/terrain/constants";

export const getTerrainTileLevel = (key: number): number => Math.floor(key / TILE_INDEX_SPAN / TILE_INDEX_SPAN);
