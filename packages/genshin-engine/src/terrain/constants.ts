// A tile key packs a level, a column and a row, each column and row offset to be positive in twenty bits: far more
// Tiles than a continent needs at any level
export const TILE_INDEX_OFFSET: number = 2 ** 19;
export const TILE_INDEX_SPAN: number = 2 ** 20;
