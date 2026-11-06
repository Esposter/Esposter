import type { Point } from "#src/models/Point";

import { toSketchedPathData } from "#src/services/export/toSketchedPathData";

// The path data of a closed outline as the export and the editor both draw it: sketched by its element's id, then closed back to its first point,
// So the stroke draws the side that returns to the start
export const toClosedSketchedPathData = (points: Point[], elementId: string): string =>
  `${toSketchedPathData(points, elementId)} Z`;
