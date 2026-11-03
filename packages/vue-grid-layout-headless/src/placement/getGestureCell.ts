import type { GridItem } from "#src/models/GridItem";

import { GRID_MIN_SPAN } from "#src/services/constants";

// The cell a pointer's travel from where it pressed puts an item on. A move shifts its origin by whole cells and keeps it
// Within the columns. A resize pulls the south-east corner, keeps the origin in place, and never shrinks below the least span
export const getGestureCell = ({
  columnNumber,
  columnPitch,
  isResize,
  offset,
  origin,
  rowPitch,
}: {
  columnNumber: number;
  columnPitch: number;
  isResize: boolean;
  offset: { x: number; y: number };
  origin: GridItem;
  rowPitch: number;
}): GridItem => {
  const columnDelta = Math.round(offset.x / columnPitch);
  const rowDelta = Math.round(offset.y / rowPitch);
  if (!isResize) {
    const x = Math.min(Math.max(origin.x + columnDelta, 0), columnNumber - origin.w);
    const y = Math.max(0, origin.y + rowDelta);
    return { h: origin.h, id: origin.id, w: origin.w, x, y };
  }

  // The right edge stops at the least span, and at the grid's right side
  const w = Math.min(Math.max(GRID_MIN_SPAN, origin.w + columnDelta), columnNumber - origin.x);
  // The bottom edge stops at the least span
  const h = Math.max(GRID_MIN_SPAN, origin.h + rowDelta);
  return { h, id: origin.id, w, x: origin.x, y: origin.y };
};
