import type { Point } from "vue-block-editor-headless";

// The straight-line distance between two points, in the units both are given in
export const getPointDistance = (point: Point, otherPoint: Point): number =>
  Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y);
