import type { Point } from "#src/models/Point";
import type { PositionedElement } from "#src/models/PositionedElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { checkIsPointInBounds } from "#src/services/checkIsPointInBounds";
import { checkIsPointInShape } from "#src/services/checkIsPointInShape";
import { getArrowRoute } from "#src/services/getArrowRoute";
import { getDistanceToPolyline } from "#src/services/getDistanceToPolyline";
import { getElementBounds } from "#src/services/getElementBounds";
import { exhaustiveGuard } from "@esposter/shared";

// Whether a point hits an element: an arrow within the tolerance of its route, a stroke within the tolerance and half its width of its path,
// A shape by its outline, and a box by its bounds
export const checkIsPointOnElement = (element: PositionedElement, point: Point, tolerance: number): boolean => {
  switch (element.type) {
    case PositionedElementType.Arrow:
      return getDistanceToPolyline(getArrowRoute(element), point) <= tolerance;
    case PositionedElementType.Image:
    case PositionedElementType.StickyNote:
    case PositionedElementType.Text:
      return checkIsPointInBounds(getElementBounds(element), point, tolerance);
    case PositionedElementType.Shape:
      return checkIsPointInShape(element, point, tolerance);
    case PositionedElementType.Stroke:
      return getDistanceToPolyline(element.points, point) <= tolerance + element.strokeWidth / 2;
    default:
      return exhaustiveGuard(element);
  }
};
