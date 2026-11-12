import type { StrokeElement } from "#src/models/StrokeElement";

import { EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { getStrokeAttributes } from "#src/services/export/getStrokeAttributes";
import { toSmoothedPathData } from "#src/services/export/toSmoothedPathData";
import { toStrokeAttributesSvg } from "#src/services/export/toStrokeAttributesSvg";

// A freehand stroke as the export draws it: its points as one smooth curve, unsketched, since the hand that drew it is the look
export const toStrokeSvg = (stroke: StrokeElement): string =>
  `<path d="${toSmoothedPathData(stroke.points)}" fill="none" ${toStrokeAttributesSvg(getStrokeAttributes(stroke, EXPORT_LINE_COLOR))} stroke-linecap="round" stroke-linejoin="round"/>`;
