import type { ArrowElement } from "#src/models/ArrowElement";
import type { Point } from "#src/models/Point";

import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { getCurvedRoute } from "#src/services/getCurvedRoute";
import { getRightAngledRoute } from "#src/services/getRightAngledRoute";
import { exhaustiveGuard } from "@esposter/shared";

// The polyline an arrow is drawn along, from its start point to its end point, by its path kind
export const getArrowRoute = (arrow: ArrowElement): Point[] => {
  switch (arrow.pathKind) {
    case ArrowPathKind.Curved:
      return getCurvedRoute(arrow.start, arrow.end);
    case ArrowPathKind.RightAngled:
      return getRightAngledRoute(arrow.start, arrow.end);
    case ArrowPathKind.Straight:
      return [arrow.start.point, arrow.end.point];
    default:
      return exhaustiveGuard(arrow.pathKind);
  }
};
