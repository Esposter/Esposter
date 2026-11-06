import type { Point } from "#src/models/Point";

// The control point a curve bends through beside one of its ends: a third of the span out along the end's direction,
// Or a third of the span itself when the end is free. The span runs from the curve's start towards its end
export const getCurveControl = (point: Point, direction: Point | undefined, span: Point): Point => {
  const handle = Math.hypot(span.x, span.y) / 3;
  return direction
    ? { x: point.x + direction.x * handle, y: point.y + direction.y * handle }
    : { x: point.x + span.x / 3, y: point.y + span.y / 3 };
};
