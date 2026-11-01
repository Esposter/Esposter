import type { PanzoomPinchFrame } from "#src/models/panzoom/PanzoomPinchFrame";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

import { takeOne } from "#src/util/array/takeOne";

// The distance between the first two pointers down, and the point halfway between them, which a pinch scales by and zooms about
export const getPanzoomPinchFrame = (pointers: Map<number, PanzoomPoint>): PanzoomPinchFrame => {
  const points = [...pointers.values()];
  const first = takeOne(points, 0);
  const second = takeOne(points, 1);
  return {
    distance: Math.hypot(first.x - second.x, first.y - second.y),
    midpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
  };
};
