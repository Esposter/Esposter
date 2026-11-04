import { GRID_MIN_SPAN } from "#src/services/constants";

// The number of cells a size covers, rounded up so content past a row's edge takes the next row, and never fewer than
// The least span
export const getCellSpan = (size: number, pitch: number, gap: number): number =>
  Math.max(GRID_MIN_SPAN, Math.ceil((size + gap) / pitch));
