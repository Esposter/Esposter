import type { StrokeElement } from "#src/models/StrokeElement";

import { EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { getStrokeAttributes } from "#src/services/export/getStrokeAttributes";
import { toPathData } from "#src/services/export/toPathData";
import { toStrokeAttributesSvg } from "#src/services/export/toStrokeAttributesSvg";

// A freehand stroke as the export draws it: its points as the pointer drew them, unsketched, since the hand that drew it is the look
export const toStrokeSvg = (stroke: StrokeElement): string =>
  `<path d="${toPathData(stroke.points)}" fill="none" ${toStrokeAttributesSvg(getStrokeAttributes(stroke, EXPORT_LINE_COLOR))} stroke-linecap="round" stroke-linejoin="round"/>`;
