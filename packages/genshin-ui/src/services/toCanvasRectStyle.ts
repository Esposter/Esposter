import type { CanvasRect } from "#src/models/CanvasRect";

// One axis of a RectTransform as CSS along it: the offset of its start from its parent's start (the left, or the
// Foot, since Unity's y runs up) and its length, each a share of the parent's span and a length in canvas units
const toAxis = (
  anchorMin: number,
  anchorMax: number,
  pivot: number,
  position: number,
  size: number,
  span: string,
  start: string,
): [string, string] => {
  const length = `calc(${anchorMax - anchorMin} * ${span} + ${size} * var(--canvas-unit))`;
  const offset = `calc(${start} + ${anchorMin} * ${span} + ${position} * var(--canvas-unit) - ${pivot} * ${length})`;
  return [offset, length];
};
// A RectTransform as the CSS that places it absolutely in its parent's box, as the game lays it out. A piece laid on
// The canvas itself spans the canvas, the screen less its inset at each side, where one inside another piece spans
// That piece's whole box
export const toCanvasRectStyle = (
  { anchorMax, anchorMin, pivot, position, size }: CanvasRect,
  isOnCanvas = false,
): Record<"bottom" | "height" | "left" | "width", string> & { position: "absolute" } => {
  const [left, width] = toAxis(
    anchorMin[0],
    anchorMax[0],
    pivot[0],
    position[0],
    size[0],
    isOnCanvas ? "(100% - 2 * var(--canvas-inset))" : "100%",
    isOnCanvas ? "var(--canvas-inset)" : "0px",
  );
  const [bottom, height] = toAxis(anchorMin[1], anchorMax[1], pivot[1], position[1], size[1], "100%", "0px");
  return { bottom, height, left, position: "absolute", width };
};
