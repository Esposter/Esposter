import type { PanzoomPinchFrame } from "#src/models/panzoom/PanzoomPinchFrame";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

// The distance between two pointers, and the point halfway between them
export const getPanzoomPinchFrame = (first: PanzoomPoint, second: PanzoomPoint): PanzoomPinchFrame => ({
  distance: Math.hypot(first.x - second.x, first.y - second.y),
  midpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
});
