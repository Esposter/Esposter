import type { Point } from "#src/models/Point";

import { ARROW_STUB_LENGTH } from "#src/services/constants";

// The point a stub reaches from a point along its direction, or the point itself when the end has no direction
export const getStubPoint = (point: Point, direction: Point | undefined): Point =>
  direction ? { x: point.x + direction.x * ARROW_STUB_LENGTH, y: point.y + direction.y * ARROW_STUB_LENGTH } : point;
