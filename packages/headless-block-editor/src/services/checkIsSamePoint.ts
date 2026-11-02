import type { Point } from "#src/models/Point";

export const checkIsSamePoint = (point: Point, otherPoint: Point): boolean =>
  point.x === otherPoint.x && point.y === otherPoint.y;
