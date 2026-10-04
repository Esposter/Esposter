import type { CanvasRect } from "#src/models/CanvasRect";
import type { FittedInterfaceRect } from "#src/models/FittedInterfaceRect";

const readPair = ([x = 0, y = 0]: number[]): [number, number] => [x, y];
// A rect as a fit writes it, its pairs plain arrays in the JSON, read as the canvas rect a piece is placed by
export const readCanvasRect = ({ anchorMax, anchorMin, pivot, position, size }: FittedInterfaceRect): CanvasRect => ({
  anchorMax: readPair(anchorMax),
  anchorMin: readPair(anchorMin),
  pivot: readPair(pivot),
  position: readPair(position),
  size: readPair(size),
});
