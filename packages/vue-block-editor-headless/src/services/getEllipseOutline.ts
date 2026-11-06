import type { Bounds } from "#src/models/Bounds";
import type { Point } from "#src/models/Point";

import { ELLIPSE_OUTLINE_SEGMENT_COUNT } from "#src/services/constants";

// An ellipse's outline, sampled at equal angles from its rightmost point
export const getEllipseOutline = (bounds: Bounds): Point[] => {
  const { height, width, x, y } = bounds;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  return Array.from({ length: ELLIPSE_OUTLINE_SEGMENT_COUNT }, (_element, index) => {
    const angle = (2 * Math.PI * index) / ELLIPSE_OUTLINE_SEGMENT_COUNT;
    return { x: centerX + (width / 2) * Math.cos(angle), y: centerY + (height / 2) * Math.sin(angle) };
  });
};
