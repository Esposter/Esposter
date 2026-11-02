import type { Point } from "#src/models/Point";

import { getDistanceToSegment } from "#src/services/getDistanceToSegment";
import { takeOne } from "@esposter/shared";

// The distance from a point to the nearest segment of a polyline, a polyline of one point measured to that point
export const getDistanceToPolyline = (points: Point[], point: Point): number => {
  const firstPoint = takeOne(points);
  return points
    .slice(1)
    .reduce(
      (distance, end, index) => Math.min(distance, getDistanceToSegment(takeOne(points, index), end, point)),
      getDistanceToSegment(firstPoint, firstPoint, point),
    );
};
