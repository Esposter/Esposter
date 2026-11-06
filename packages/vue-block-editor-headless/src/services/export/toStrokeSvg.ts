import type { StrokeElement } from "#src/models/StrokeElement";

import { EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { toPathData } from "#src/services/export/toPathData";

// A freehand stroke as the export draws it: its points as the pointer drew them, unsketched, since the hand that drew it is the look
export const toStrokeSvg = ({ points, strokeWidth }: StrokeElement): string =>
  `<path d="${toPathData(points)}" fill="none" stroke="${EXPORT_LINE_COLOR}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
