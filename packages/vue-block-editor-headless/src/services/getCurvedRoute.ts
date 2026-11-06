import type { ArrowEnd } from "#src/models/ArrowEnd";
import type { Point } from "#src/models/Point";

import { ARROW_CURVE_SEGMENT_COUNT } from "#src/services/constants";
import { getArrowEndDirection } from "#src/services/getArrowEndDirection";
import { getBezierPoint } from "#src/services/getBezierPoint";
import { getCurveControl } from "#src/services/getCurveControl";
import { removeRepeatedPoints } from "#src/services/removeRepeatedPoints";

// A curve between two ends, sampled into straight pieces
export const getCurvedRoute = (start: ArrowEnd, end: ArrowEnd): Point[] => {
  const span = { x: end.point.x - start.point.x, y: end.point.y - start.point.y };
  const controlPoints = [
    start.point,
    getCurveControl(start.point, getArrowEndDirection(start), span),
    getCurveControl(end.point, getArrowEndDirection(end), { x: -span.x, y: -span.y }),
    end.point,
  ];
  return removeRepeatedPoints(
    Array.from({ length: ARROW_CURVE_SEGMENT_COUNT + 1 }, (_element, index) =>
      getBezierPoint(controlPoints, index / ARROW_CURVE_SEGMENT_COUNT),
    ),
  );
};
