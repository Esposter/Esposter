import type { GridCell } from "#src/models/GridCell";

// Two cells are the same when they cover the same rectangle of the grid
export const checkIsSameCell = (cell: GridCell, other: GridCell): boolean =>
  cell.h === other.h && cell.w === other.w && cell.x === other.x && cell.y === other.y;
