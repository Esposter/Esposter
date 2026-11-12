import type { Point } from "#src/models/Point";

import { takeOne } from "@esposter/shared";

// The path data of a freehand stroke as a smooth curve through its points: each point but the first and the last controls a quadratic curve that ends
// Halfway to the next point, so a turn bends instead of drawing a corner, and the last point is a line from the final curve
export const toSmoothedPathData = (points: Point[]): string => {
  const firstPoint = takeOne(points);
  const lastPoint = takeOne(points, points.length - 1);
  const curves = points.slice(1, -1).map((control, index) => {
    const next = takeOne(points, index + 2);
    return `Q${control.x} ${control.y} ${(control.x + next.x) / 2} ${(control.y + next.y) / 2}`;
  });
  const lines = points.length > 1 ? [`L${lastPoint.x} ${lastPoint.y}`] : [];
  return [`M${firstPoint.x} ${firstPoint.y}`, ...curves, ...lines].join(" ");
};
