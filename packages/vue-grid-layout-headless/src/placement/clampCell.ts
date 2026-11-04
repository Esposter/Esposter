import type { GridCell } from "#src/models/GridCell";

import { GRID_MIN_SPAN } from "#src/services/constants";

// The one bound a cell is held within: at least one cell in each direction, no more columns than the grid has, moved in from
// The right edge if it hangs over it, and moved down to the top row if it sits above it
export const clampCell = <T extends GridCell>(cell: T, columnNumber: number): T => {
  const h = Math.max(GRID_MIN_SPAN, cell.h);
  const w = Math.max(GRID_MIN_SPAN, Math.min(cell.w, columnNumber));
  const x = Math.min(Math.max(cell.x, 0), columnNumber - w);
  return { ...cell, h, w, x, y: Math.max(cell.y, 0) };
};
