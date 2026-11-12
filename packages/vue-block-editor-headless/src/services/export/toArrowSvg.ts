import type { ArrowElement } from "#src/models/ArrowElement";

import { EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { escapeSvgValue } from "#src/services/export/escapeSvgValue";
import { getArrowheads } from "#src/services/export/getArrowheads";
import { getStrokeAttributes } from "#src/services/export/getStrokeAttributes";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { toPolygonPoints } from "#src/services/export/toPolygonPoints";
import { toSketchedPathData } from "#src/services/export/toSketchedPathData";
import { toStrokeAttributesSvg } from "#src/services/export/toStrokeAttributesSvg";
import { getArrowRoute } from "#src/services/getArrowRoute";

// An arrow as the export draws it: its route sketched in its colour, an arrowhead in the same colour at each end that has one, and its label at the route's midpoint
export const toArrowSvg = (arrow: ArrowElement): string => {
  const route = getArrowRoute(arrow);
  // A route of one point, a curve folded onto its own start, has no line to draw, so the arrow draws nothing
  if (route.length < 2) return "";
  const attributes = getStrokeAttributes(arrow, EXPORT_LINE_COLOR);
  return [
    `<path d="${toSketchedPathData(route, arrow.id, arrow.sketchLevel)}" fill="none" ${toStrokeAttributesSvg(attributes)}/>`,
    ...getArrowheads(arrow, route).map(
      (points) => `<polygon points="${toPolygonPoints(points)}" fill="${escapeSvgValue(attributes.stroke)}"/>`,
    ),
    toElementTextSvg(arrow),
  ].join("");
};
