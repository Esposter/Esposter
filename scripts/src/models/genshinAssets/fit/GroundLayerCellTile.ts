import type { GroundLayer } from "genshin-engine";

// A terrain tile's cells, row by row along the game's z with its x within a row, each painted in the ground layer its
// Splat gives it, with the tile's column, name and row in the world and its cells a side
export interface GroundLayerCellTile {
  cells: GroundLayer[];
  column: number;
  name: string;
  resolution: number;
  row: number;
}
