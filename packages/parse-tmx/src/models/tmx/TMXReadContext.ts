import type { TMXPendingTileData } from "#src/models/tmx/TMXPendingTileData";

// What every element of one document reads from and writes to: the tile data awaiting decoding, and the cell count
// Each layer of a finite map must hold
export interface TMXReadContext {
  pending: TMXPendingTileData[];
  tileCount: number;
}
