import type { Point } from "headless-block-editor";

import { GRID_SIZE, snapToGrid } from "headless-block-editor";

// The point on the grid when snap is on, and the point as it is when it is not
export const getSnappedPoint = (point: Point, isSnapEnabled: boolean): Point =>
  isSnapEnabled ? { x: snapToGrid(point.x, GRID_SIZE), y: snapToGrid(point.y, GRID_SIZE) } : point;
