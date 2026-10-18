import type { GridItem } from "#src/models/GridItem";

import { GridGestureType } from "#src/models/GridGestureType";
import { GRID_MIN_SPAN } from "#src/services/constants";

// The cell a pointer's travel from where it pressed puts an item on: a move shifts its origin by whole cells and keeps
// It within the columns, and a resize grows or shrinks its span by whole cells, never below the least span
export const getGestureCell = ({
  columnNumber,
  columnPitch,
  kind,
  offset,
  origin,
  rowPitch,
}: {
  columnNumber: number;
  columnPitch: number;
  kind: GridGestureType;
  offset: { x: number; y: number };
  origin: GridItem;
  rowPitch: number;
}): GridItem => {
  const columnDelta = Math.round(offset.x / columnPitch);
  const rowDelta = Math.round(offset.y / rowPitch);
  if (kind === GridGestureType.Move) {
    const x = Math.min(Math.max(origin.x + columnDelta, 0), columnNumber - origin.w);
    const y = Math.max(0, origin.y + rowDelta);
    return { h: origin.h, id: origin.id, w: origin.w, x, y };
  }

  const w = Math.min(Math.max(GRID_MIN_SPAN, origin.w + columnDelta), columnNumber - origin.x);
  const h = Math.max(GRID_MIN_SPAN, origin.h + rowDelta);
  return { h, id: origin.id, w, x: origin.x, y: origin.y };
};
