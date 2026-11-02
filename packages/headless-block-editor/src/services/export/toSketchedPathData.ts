import type { Point } from "#src/models/Point";

import { getSketchedPoints } from "#src/services/export/getSketchedPoints";
import { toPathData } from "#src/services/export/toPathData";

// The path data of an outline as the export and the editor both draw it: sketched by its element's id, so the element draws the same sketch every time
export const toSketchedPathData = (points: Point[], elementId: string): string =>
  toPathData(getSketchedPoints(points, elementId));
