import type { Point } from "#src/models/Point";

import { takeOne } from "@esposter/shared";

// Whether a point lies inside a polygon, by counting the sides a ray cast from it crosses
export const checkIsPointInPolygon = (polygon: Point[], point: Point): boolean =>
  polygon.reduce((isInside, current, index) => {
    const previous = takeOne(polygon, (index - 1 + polygon.length) % polygon.length);
    const isCrossing =
      current.y > point.y !== previous.y > point.y &&
      point.x < ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x;
    return isCrossing ? !isInside : isInside;
  }, false);
