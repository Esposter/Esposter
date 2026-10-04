import type { CanvasRect } from "#src/models/CanvasRect";
import type { FittedInterfaceRect } from "#src/models/FittedInterfaceRect";

const toPair = ([x = 0, y = 0]: number[]): [number, number] => [x, y];
// A rect as a fit writes it, its pairs plain arrays in the JSON, read as the canvas rect a piece is placed by
export const toCanvasRect = ({ anchorMax, anchorMin, pivot, position, size }: FittedInterfaceRect): CanvasRect => ({
  anchorMax: toPair(anchorMax),
  anchorMin: toPair(anchorMin),
  pivot: toPair(pivot),
  position: toPair(position),
  size: toPair(size),
});
