import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { Position } from "#src/models/Position";

// A position is outside the grid when its row is missing, or its column lies before the first or past the last of its row
export const checkIsOutsideGrid = (tiles: GridEngineConfig["tiles"], position: Position): boolean => {
  const row = tiles[position.y];
  return row === undefined || position.x < 0 || position.x >= row.length;
};
