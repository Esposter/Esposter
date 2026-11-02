import type { Point } from "#src/models/Point";

import { getSketchOffset } from "#src/services/export/getSketchOffset";

// The points of an outline, each moved by an offset keyed on its element's id and its index, so the element draws the same sketch every time
export const getSketchedPoints = (points: Point[], elementId: string): Point[] =>
  points.map((point, index) => ({
    x: point.x + getSketchOffset(`${elementId}:${index}:x`),
    y: point.y + getSketchOffset(`${elementId}:${index}:y`),
  }));
