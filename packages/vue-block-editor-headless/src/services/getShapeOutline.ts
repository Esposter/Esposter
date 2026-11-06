import type { Point } from "#src/models/Point";
import type { ShapeElement } from "#src/models/ShapeElement";

import { ShapeKind } from "#src/models/ShapeKind";
import { INPUT_OUTPUT_SLANT_RATIO } from "#src/services/constants";
import { getBoundsCorners } from "#src/services/getBoundsCorners";
import { getEdgeMidpoints } from "#src/services/getEdgeMidpoints";
import { getEllipseOutline } from "#src/services/getEllipseOutline";
import { exhaustiveGuard } from "@esposter/shared";

// A shape's outline as the polygon hit testing measures it, in the order its sides run
// The terminal and the predefined process are measured by their box, which is their outline's extent
export const getShapeOutline = (shape: ShapeElement): Point[] => {
  const { height, width, x, y } = shape;
  switch (shape.kind) {
    case ShapeKind.Annotation:
    case ShapeKind.PredefinedProcess:
    case ShapeKind.Process:
    case ShapeKind.Rectangle:
    case ShapeKind.Terminal:
      return getBoundsCorners(shape);
    case ShapeKind.Decision:
    case ShapeKind.Diamond:
      return getEdgeMidpoints(shape);
    case ShapeKind.Ellipse:
      return getEllipseOutline(shape);
    case ShapeKind.InputOutput: {
      const slant = width * INPUT_OUTPUT_SLANT_RATIO;
      return [
        { x: x + slant, y },
        { x: x + width, y },
        { x: x + width - slant, y: y + height },
        { x, y: y + height },
      ];
    }
    default:
      return exhaustiveGuard(shape.kind);
  }
};
