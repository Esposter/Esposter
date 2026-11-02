import type { ArrowEnd } from "#src/models/ArrowEnd";
import type { Point } from "#src/models/Point";

import { getConnectionPointDirection } from "#src/services/getConnectionPointDirection";

// The direction an arrow end leaves its shape along, or undefined for a free end
export const getArrowEndDirection = (arrowEnd: ArrowEnd): Point | undefined =>
  arrowEnd.binding ? getConnectionPointDirection(arrowEnd.binding.connectionPointIndex) : undefined;
