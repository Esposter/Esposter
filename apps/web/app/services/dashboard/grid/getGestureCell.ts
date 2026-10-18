import type { GridItem } from "@/models/dashboard/GridItem";

import { GridGestureType } from "@/models/dashboard/GridGestureType";
import { getCellSize } from "@/services/dashboard/grid/getCellSize";
import { getCellSpan } from "@/services/dashboard/grid/getCellSpan";
import { clamp } from "@vueuse/core";

// The cell a pointer's travel from where it pressed puts a tile on: a move shifts its origin by whole cells and keeps it
// Within the columns, and a resize grows or shrinks its span by whole cells, never below one
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
  if (kind === GridGestureType.Move) {
    const x = clamp(origin.x + Math.round(offset.x / columnPitch), 0, columnNumber - origin.w);
    const y = Math.max(0, origin.y + Math.round(offset.y / rowPitch));
    return { h: origin.h, id: origin.id, w: origin.w, x, y };
  }

  const w = Math.min(getCellSpan(getCellSize(origin.w, columnPitch) + offset.x, columnPitch), columnNumber - origin.x);
  const h = getCellSpan(getCellSize(origin.h, rowPitch) + offset.y, rowPitch);
  return { h, id: origin.id, w, x: origin.x, y: origin.y };
};
