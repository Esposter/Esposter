import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { Position } from "#src/models/Position";

// A position is outside the grid when it is not a whole tile, or when its row is missing.
// It is also outside when its column lies before the first or past the last of its row.
// NaN fails the whole-tile test, so it is outside too.
export const checkIsOutsideGrid = (tiles: GridEngineConfig["tiles"], position: Position): boolean => {
  if (!Number.isInteger(position.x) || !Number.isInteger(position.y)) return true;
  const row = tiles[position.y];
  return row === undefined || position.x < 0 || position.x >= row.length;
};
