import type { Point } from "#src/models/Point";

import { takeOne } from "@esposter/shared";

// The point of a cubic Bézier curve at a progress from 0 to 1, given its four control points from its start to its end
export const getBezierPoint = (controlPoints: Point[], progress: number): Point => {
  const remaining = 1 - progress;
  const weights = [remaining ** 3, 3 * remaining ** 2 * progress, 3 * remaining * progress ** 2, progress ** 3];
  return controlPoints.reduce(
    (point, controlPoint, index) => ({
      x: point.x + controlPoint.x * takeOne(weights, index),
      y: point.y + controlPoint.y * takeOne(weights, index),
    }),
    { x: 0, y: 0 },
  );
};
