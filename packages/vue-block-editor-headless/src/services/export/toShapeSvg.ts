import type { ShapeElement } from "#src/models/ShapeElement";

import { EXPORT_LINE_ATTRIBUTES } from "#src/services/export/constants";
import { escapeSvgValue } from "#src/services/export/escapeSvgValue";
import { toClosedSketchedPathData } from "#src/services/export/toClosedSketchedPathData";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { getShapeOutline } from "#src/services/getShapeOutline";

// A shape as the export draws it: its outline sketched and filled, with its text centred in its box
export const toShapeSvg = (shape: ShapeElement): string => {
  const { fill, id } = shape;
  return `<path d="${toClosedSketchedPathData(getShapeOutline(shape), id)}" fill="${escapeSvgValue(fill)}" ${EXPORT_LINE_ATTRIBUTES}/>${toElementTextSvg(shape)}`;
};
