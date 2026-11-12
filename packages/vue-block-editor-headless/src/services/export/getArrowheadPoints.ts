import type { Point } from "#src/models/Point";

import { ArrowheadKind } from "#src/models/ArrowheadKind";
import {
  ARROWHEAD_BAR_THICKNESS,
  ARROWHEAD_CIRCLE_CORNERS,
  ARROWHEAD_HALF_WIDTH,
  ARROWHEAD_LENGTH,
} from "#src/services/export/constants";
import { exhaustiveGuard } from "@esposter/shared";

// The corners of an arrowhead of a kind whose tip sits at a point, opening back along the line from the point before it. A triangle and a diamond
// Are the corners of a filled shape, a bar a filled strip across the line at its tip, and a circle a polygon of corners on its circumference
export const getArrowheadPoints = (arrowhead: ArrowheadKind, tip: Point, previous: Point): Point[] => {
  const length = Math.hypot(tip.x - previous.x, tip.y - previous.y);
  // A run of no length has no direction, so its arrowhead collapses onto its tip
  if (length === 0) return [tip, tip, tip];

  const direction = { x: (tip.x - previous.x) / length, y: (tip.y - previous.y) / length };
  const normal = { x: -direction.y, y: direction.x };
  // The point a distance back along the line from the tip, and a distance out to one side of it
  const getPoint = (back: number, side: number): Point => ({
    x: tip.x - direction.x * back + normal.x * side,
    y: tip.y - direction.y * back + normal.y * side,
  });
  switch (arrowhead) {
    case ArrowheadKind.Bar:
      return [
        getPoint(0, ARROWHEAD_HALF_WIDTH),
        getPoint(0, -ARROWHEAD_HALF_WIDTH),
        getPoint(ARROWHEAD_BAR_THICKNESS, -ARROWHEAD_HALF_WIDTH),
        getPoint(ARROWHEAD_BAR_THICKNESS, ARROWHEAD_HALF_WIDTH),
      ];
    case ArrowheadKind.Circle: {
      // The circle sits a radius back from its tip, so its front touches the point the arrow ends at
      const centre = getPoint(ARROWHEAD_HALF_WIDTH, 0);
      return Array.from({ length: ARROWHEAD_CIRCLE_CORNERS }, (_, index) => {
        const angle = (2 * Math.PI * index) / ARROWHEAD_CIRCLE_CORNERS;
        return {
          x: centre.x + ARROWHEAD_HALF_WIDTH * Math.cos(angle),
          y: centre.y + ARROWHEAD_HALF_WIDTH * Math.sin(angle),
        };
      });
    }
    case ArrowheadKind.Diamond:
      return [
        tip,
        getPoint(ARROWHEAD_LENGTH / 2, ARROWHEAD_HALF_WIDTH),
        getPoint(ARROWHEAD_LENGTH, 0),
        getPoint(ARROWHEAD_LENGTH / 2, -ARROWHEAD_HALF_WIDTH),
      ];
    case ArrowheadKind.Triangle:
      return [tip, getPoint(ARROWHEAD_LENGTH, ARROWHEAD_HALF_WIDTH), getPoint(ARROWHEAD_LENGTH, -ARROWHEAD_HALF_WIDTH)];
    default:
      return exhaustiveGuard(arrowhead);
  }
};
