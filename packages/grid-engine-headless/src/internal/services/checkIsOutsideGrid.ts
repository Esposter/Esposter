import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { Position } from "#src/models/Position";

// A position is outside the grid when it is not a whole tile, when its row is missing, or when its column lies before
// The First or past the last of its row. NaN fails the whole-tile test, so it is outside too
export const checkIsOutsideGrid = (tiles: GridEngineConfig["tiles"], position: Position): boolean => {
  if (!Number.isInteger(position.x) || !Number.isInteger(position.y)) return true;
  const row = tiles[position.y];
  return row === undefined || position.x < 0 || position.x >= row.length;
};
