import type { Point } from "#src/models/Point";
import type { SketchLevel } from "#src/models/SketchLevel";

import { getSketchedPoints } from "#src/services/export/getSketchedPoints";
import { toPathData } from "#src/services/export/toPathData";

// The path data of an open outline or route as the export and the editor both draw it: sketched at its element's level, so the element draws the same sketch every time
export const toSketchedPathData = (points: Point[], elementId: string, sketchLevel: SketchLevel): string =>
  toPathData(getSketchedPoints(points, elementId, sketchLevel));
