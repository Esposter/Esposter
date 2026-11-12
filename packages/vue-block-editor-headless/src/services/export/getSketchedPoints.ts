import type { Point } from "#src/models/Point";
import type { SketchLevel } from "#src/models/SketchLevel";

import { getSketchOffset } from "#src/services/export/getSketchOffset";

// The points of an outline, each moved by an offset keyed on its element's id and its index at the element's sketch level, so the element draws the same sketch every time
export const getSketchedPoints = (points: Point[], elementId: string, sketchLevel: SketchLevel): Point[] =>
  points.map((point, index) => ({
    x: point.x + getSketchOffset(`${elementId}:${index}:x`, sketchLevel),
    y: point.y + getSketchOffset(`${elementId}:${index}:y`, sketchLevel),
  }));
