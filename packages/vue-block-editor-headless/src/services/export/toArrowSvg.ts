import type { ArrowElement } from "#src/models/ArrowElement";

import { EXPORT_LINE_ATTRIBUTES, EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { getArrowheads } from "#src/services/export/getArrowheads";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { toPolygonPoints } from "#src/services/export/toPolygonPoints";
import { toSketchedPathData } from "#src/services/export/toSketchedPathData";
import { getArrowRoute } from "#src/services/getArrowRoute";

// An arrow as the export draws it: its route sketched, an arrowhead at each end that has one, and its label at the route's midpoint
export const toArrowSvg = (arrow: ArrowElement): string => {
  const route = getArrowRoute(arrow);
  // A route of one point, a curve folded onto its own start, has no line to draw, so the arrow draws nothing
  if (route.length < 2) return "";
  return [
    `<path d="${toSketchedPathData(route, arrow.id)}" fill="none" ${EXPORT_LINE_ATTRIBUTES}/>`,
    ...getArrowheads(arrow, route).map(
      (points) => `<polygon points="${toPolygonPoints(points)}" fill="${EXPORT_LINE_COLOR}"/>`,
    ),
    toElementTextSvg(arrow),
  ].join("");
};
