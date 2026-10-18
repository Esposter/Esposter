import type { GridItem } from "#src/models/GridItem";

import { ResizeEdge } from "#src/models/ResizeEdge";
import { GRID_MIN_SPAN } from "#src/services/constants";

// The sides each edge pulls, as one map so an edge added to ResizeEdge is a type error until it names its sides
const ResizeEdgeSidesMap = {
  [ResizeEdge.East]: { isEast: true, isNorth: false, isSouth: false, isWest: false },
  [ResizeEdge.North]: { isEast: false, isNorth: true, isSouth: false, isWest: false },
  [ResizeEdge.NorthEast]: { isEast: true, isNorth: true, isSouth: false, isWest: false },
  [ResizeEdge.NorthWest]: { isEast: false, isNorth: true, isSouth: false, isWest: true },
  [ResizeEdge.South]: { isEast: false, isNorth: false, isSouth: true, isWest: false },
  [ResizeEdge.SouthEast]: { isEast: true, isNorth: false, isSouth: true, isWest: false },
  [ResizeEdge.SouthWest]: { isEast: false, isNorth: false, isSouth: true, isWest: true },
  [ResizeEdge.West]: { isEast: false, isNorth: false, isSouth: false, isWest: true },
} as const satisfies Record<ResizeEdge, { isEast: boolean; isNorth: boolean; isSouth: boolean; isWest: boolean }>;

// The cell a pointer's travel from where it pressed puts an item on. A move shifts its origin by whole cells and keeps it
// Within the columns. A resize moves the edges it pulls and keeps the opposite ones in place, and never shrinks below the
// Least span
export const getGestureCell = ({
  columnNumber,
  columnPitch,
  edge,
  offset,
  origin,
  rowPitch,
}: {
  columnNumber: number;
  columnPitch: number;
  edge?: ResizeEdge;
  offset: { x: number; y: number };
  origin: GridItem;
  rowPitch: number;
}): GridItem => {
  const columnDelta = Math.round(offset.x / columnPitch);
  const rowDelta = Math.round(offset.y / rowPitch);
  if (!edge) {
    const x = Math.min(Math.max(origin.x + columnDelta, 0), columnNumber - origin.w);
    const y = Math.max(0, origin.y + rowDelta);
    return { h: origin.h, id: origin.id, w: origin.w, x, y };
  }

  const { isEast, isNorth, isSouth, isWest } = ResizeEdgeSidesMap[edge];
  const right = origin.x + origin.w;
  const bottom = origin.y + origin.h;
  // The left edge stops at the grid's left side, and at the least span short of the right edge
  const leftX = Math.min(Math.max(origin.x + columnDelta, 0), right - GRID_MIN_SPAN);
  // The right edge stops at the least span, and at the grid's right side
  const eastWidth = Math.min(Math.max(GRID_MIN_SPAN, origin.w + columnDelta), columnNumber - origin.x);
  // The top edge stops at the grid's top, and at the least span short of the bottom edge
  const topY = Math.min(Math.max(origin.y + rowDelta, 0), bottom - GRID_MIN_SPAN);
  // The bottom edge stops at the least span
  const southHeight = Math.max(GRID_MIN_SPAN, origin.h + rowDelta);
  const x = isWest ? leftX : origin.x;
  const widthFromRight = isEast ? eastWidth : origin.w;
  const w = isWest ? right - leftX : widthFromRight;
  const y = isNorth ? topY : origin.y;
  const heightFromBottom = isSouth ? southHeight : origin.h;
  const h = isNorth ? bottom - topY : heightFromBottom;
  return { h, id: origin.id, w, x, y };
};
