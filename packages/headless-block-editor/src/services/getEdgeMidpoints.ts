import type { Bounds } from "#src/models/Bounds";
import type { Point } from "#src/models/Point";

// The midpoints of a box's four edges, from the top one clockwise: the connection points of a shape, and the vertices of a diamond
export const getEdgeMidpoints = (bounds: Bounds): Point[] => {
  const { height, width, x, y } = bounds;
  return [
    { x: x + width / 2, y },
    { x: x + width, y: y + height / 2 },
    { x: x + width / 2, y: y + height },
    { x, y: y + height / 2 },
  ];
};
