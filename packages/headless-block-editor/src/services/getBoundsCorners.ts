import type { Bounds } from "#src/models/Bounds";
import type { Point } from "#src/models/Point";

// The four corners of a box, from its top left, clockwise
export const getBoundsCorners = ({ height, width, x, y }: Bounds): Point[] => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height },
];
