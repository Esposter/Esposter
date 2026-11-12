import type { ShapeElement } from "#src/models/ShapeElement";

import { CornerStyle } from "#src/models/CornerStyle";
import { ShapeKind } from "#src/models/ShapeKind";
import { CORNER_RADIUS_LIMIT, CORNER_RADIUS_SHARE } from "#src/services/export/constants";
import { getSketchedPoints } from "#src/services/export/getSketchedPoints";
import { toClosedSketchedPathData } from "#src/services/export/toClosedSketchedPathData";
import { toRoundedPathData } from "#src/services/export/toRoundedPathData";
import { getShapeOutline } from "#src/services/getShapeOutline";

// A shape's outline as the export and the editor both draw it: sketched at its level, then, when its corners are round, curved at each corner. The
// Ellipse has no corners, so it is never curved, and a round corner's radius is a share of the shorter side of the shape's box, up to a limit
export const toShapeOutlinePathData = (shape: ShapeElement): string => {
  const points = getShapeOutline(shape);
  if (shape.cornerStyle === CornerStyle.Sharp || shape.kind === ShapeKind.Ellipse)
    return toClosedSketchedPathData(points, shape.id, shape.sketchLevel);
  const radius = Math.min(Math.min(shape.width, shape.height) * CORNER_RADIUS_SHARE, CORNER_RADIUS_LIMIT);
  return toRoundedPathData(getSketchedPoints(points, shape.id, shape.sketchLevel), radius);
};
