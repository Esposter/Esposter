import type { Point } from "#src/models/Point";

import { ARROWHEAD_HALF_WIDTH, ARROWHEAD_LENGTH } from "#src/services/export/constants";

// The three corners of an arrowhead whose tip sits at a point, opening back along the line from the point before it
export const getArrowheadPoints = (tip: Point, previous: Point): Point[] => {
  const length = Math.hypot(tip.x - previous.x, tip.y - previous.y);
  // A run of no length has no direction, so its arrowhead collapses onto its tip
  if (length === 0) return [tip, tip, tip];
  const direction = { x: (tip.x - previous.x) / length, y: (tip.y - previous.y) / length };
  const base = { x: tip.x - direction.x * ARROWHEAD_LENGTH, y: tip.y - direction.y * ARROWHEAD_LENGTH };
  const side = { x: -direction.y * ARROWHEAD_HALF_WIDTH, y: direction.x * ARROWHEAD_HALF_WIDTH };
  return [tip, { x: base.x + side.x, y: base.y + side.y }, { x: base.x - side.x, y: base.y - side.y }];
};
