// A tile key packs a level, a column and a row, each column and row offset to be positive in twenty bits: far more
// Tiles than a continent needs at any level
export const TILE_INDEX_OFFSET: number = 2 ** 19;
export const TILE_INDEX_SPAN: number = 2 ** 20;
// The render layer every terrain tile is also on, which the ground capture's camera alone sees
export const TERRAIN_LAYER = 1;
// The side of the cells terrain items are filed in, in metres, so a height sums only the items reaching its cell
export const TERRAIN_CELL_SIZE = 64;
// A Gaussian shape reaches three of its widths, past which a hill is cut, a little over a hundredth of its height
export const GAUSSIAN_REACH_WIDTHS = 3;
