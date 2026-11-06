import type { Point } from "vue-block-editor-headless";

import { GRID_SIZE, snapToGrid } from "vue-block-editor-headless";

// The point on the grid when snap is on, and the point as it is when it is not
export const getSnappedPoint = (point: Point, isSnapEnabled: boolean): Point =>
  isSnapEnabled ? { x: snapToGrid(point.x, GRID_SIZE), y: snapToGrid(point.y, GRID_SIZE) } : point;
