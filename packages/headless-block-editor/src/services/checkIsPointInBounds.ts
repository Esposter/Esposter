import type { Bounds } from "#src/models/Bounds";
import type { Point } from "#src/models/Point";

// A point hits a box inside its bounds, extended by the tolerance on every side
export const checkIsPointInBounds = (bounds: Bounds, point: Point, tolerance: number): boolean =>
  point.x >= bounds.x - tolerance &&
  point.x <= bounds.x + bounds.width + tolerance &&
  point.y >= bounds.y - tolerance &&
  point.y <= bounds.y + bounds.height + tolerance;
