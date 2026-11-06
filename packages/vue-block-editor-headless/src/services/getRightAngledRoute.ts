import type { ArrowEnd } from "#src/models/ArrowEnd";
import type { Point } from "#src/models/Point";

import { checkIsVertical } from "#src/services/checkIsVertical";
import { getArrowEndDirection } from "#src/services/getArrowEndDirection";
import { getRightAngledMiddlePoints } from "#src/services/getRightAngledMiddlePoints";
import { getStubPoint } from "#src/services/getStubPoint";
import { removeRepeatedPoints } from "#src/services/removeRepeatedPoints";

// A route of right angles between two ends: out of each end along its direction for a stub, then between the two stubs
export const getRightAngledRoute = (start: ArrowEnd, end: ArrowEnd): Point[] => {
  const startDirection = getArrowEndDirection(start);
  const endDirection = getArrowEndDirection(end);
  const startStub = getStubPoint(start.point, startDirection);
  const endStub = getStubPoint(end.point, endDirection);
  const middlePoints = getRightAngledMiddlePoints(
    startStub,
    endStub,
    checkIsVertical(startDirection),
    checkIsVertical(endDirection),
  );
  return removeRepeatedPoints([start.point, startStub, ...middlePoints, endStub, end.point]);
};
