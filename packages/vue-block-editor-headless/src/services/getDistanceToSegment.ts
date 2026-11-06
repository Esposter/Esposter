import type { Point } from "#src/models/Point";

// The distance from a point to the nearest point of a segment, a segment of no length measured to its one point
export const getDistanceToSegment = (start: Point, end: Point, point: Point): number => {
  const vectorX = end.x - start.x;
  const vectorY = end.y - start.y;
  const lengthSquared = vectorX * vectorX + vectorY * vectorY;
  const progress =
    lengthSquared === 0
      ? 0
      : Math.min(1, Math.max(0, ((point.x - start.x) * vectorX + (point.y - start.y) * vectorY) / lengthSquared));
  return Math.hypot(point.x - (start.x + progress * vectorX), point.y - (start.y + progress * vectorY));
};
