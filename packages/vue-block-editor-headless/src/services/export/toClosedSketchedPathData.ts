import type { Point } from "#src/models/Point";
import type { SketchLevel } from "#src/models/SketchLevel";

import { toSketchedPathData } from "#src/services/export/toSketchedPathData";

// The path data of a sharp closed outline as the export and the editor both draw it: sketched at its element's level, then closed back to its first point,
// So the stroke draws the side that returns to the start
export const toClosedSketchedPathData = (points: Point[], elementId: string, sketchLevel: SketchLevel): string =>
  `${toSketchedPathData(points, elementId, sketchLevel)} Z`;
