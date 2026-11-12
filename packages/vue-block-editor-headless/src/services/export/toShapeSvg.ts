import type { ShapeElement } from "#src/models/ShapeElement";

import { EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { escapeSvgValue } from "#src/services/export/escapeSvgValue";
import { getStrokeAttributes } from "#src/services/export/getStrokeAttributes";
import { toClosedSketchedPathData } from "#src/services/export/toClosedSketchedPathData";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { toStrokeAttributesSvg } from "#src/services/export/toStrokeAttributesSvg";
import { getShapeOutline } from "#src/services/getShapeOutline";

// A shape as the export draws it: its outline sketched, filled when it has a fill and open when it has none, with its text centred in its box
export const toShapeSvg = (shape: ShapeElement): string => {
  const { fill, id } = shape;
  const strokeAttributes = toStrokeAttributesSvg(getStrokeAttributes(shape, EXPORT_LINE_COLOR));
  return `<path d="${toClosedSketchedPathData(getShapeOutline(shape), id)}" fill="${escapeSvgValue(fill || "none")}" ${strokeAttributes}/>${toElementTextSvg(shape)}`;
};
