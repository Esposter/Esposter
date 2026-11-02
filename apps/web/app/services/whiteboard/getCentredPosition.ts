import type { Point, Size } from "headless-block-editor";

// The top left corner of a box of a size that sits centred on a point
export const getCentredPosition = (centre: Point, size: Size): Point => ({
  x: centre.x - size.width / 2,
  y: centre.y - size.height / 2,
});
