import type { ShapeElement } from "#src/models/ShapeElement";

import { EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { escapeSvgValue } from "#src/services/export/escapeSvgValue";
import { getStrokeAttributes } from "#src/services/export/getStrokeAttributes";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { toShapeOutlinePathData } from "#src/services/export/toShapeOutlinePathData";
import { toStrokeAttributesSvg } from "#src/services/export/toStrokeAttributesSvg";

// A shape as the export draws it: its outline sketched at its level and rounded at its corners when they are round, filled when it has a fill and open when it has none, with its text centred in its box
export const toShapeSvg = (shape: ShapeElement): string => {
  const { fill } = shape;
  const strokeAttributes = toStrokeAttributesSvg(getStrokeAttributes(shape, EXPORT_LINE_COLOR));
  return `<path d="${toShapeOutlinePathData(shape)}" fill="${escapeSvgValue(fill || "none")}" ${strokeAttributes}/>${toElementTextSvg(shape)}`;
};
