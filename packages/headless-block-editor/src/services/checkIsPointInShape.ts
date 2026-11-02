import type { Point } from "#src/models/Point";
import type { ShapeElement } from "#src/models/ShapeElement";

import { checkIsPointInPolygon } from "#src/services/checkIsPointInPolygon";
import { getDistanceToPolyline } from "#src/services/getDistanceToPolyline";
import { getShapeOutline } from "#src/services/getShapeOutline";
import { takeOne } from "@esposter/shared";

// A point hits a shape inside its outline, or within the tolerance of the outline
export const checkIsPointInShape = (shape: ShapeElement, point: Point, tolerance: number): boolean => {
  const outline = getShapeOutline(shape);
  return (
    checkIsPointInPolygon(outline, point) || getDistanceToPolyline([...outline, takeOne(outline)], point) <= tolerance
  );
};
