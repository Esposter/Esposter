import { TILE_NAME_PREFIX } from "#src/services/genshinAssets/world/constants";

// A tile of the open world by its column and row: the world's x over its side, and its z (BigWorld_1_-2 is column 1,
// Row -2), which names both its StreamGen blob and its index
export const getWorldTileName = (column: number, row: number): string => `${TILE_NAME_PREFIX}_${column}_${row}`;
