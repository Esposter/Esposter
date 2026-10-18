import { GRID_MIN_SPAN } from "#src/services/constants";

// The number of cells a size covers, and never fewer than the least span
export const getCellSpan = (size: number, pitch: number, gap: number): number =>
  Math.max(GRID_MIN_SPAN, Math.round((size + gap) / pitch));
