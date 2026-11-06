import type { Point, Size } from "vue-block-editor-headless";

// The top left corner of a box of a size that sits centred on a point
export const getCentredPosition = (centre: Point, size: Size): Point => ({
  x: centre.x - size.width / 2,
  y: centre.y - size.height / 2,
});
