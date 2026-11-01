import type { CanvasRect } from "#src/models/CanvasRect";

import { computeRectOffsets } from "#src/services/computeRectOffsets";
import { toAxis } from "#src/services/toAxis";

// A RectTransform as the CSS that places it absolutely in its parent's box, as the game lays it out. A piece laid on
// The canvas itself spans the canvas, the screen less its inset at each side, where one inside another piece spans
// That piece's whole box
export const toCanvasRectStyle = (
  rect: CanvasRect,
  isOnCanvas = false,
): Record<"bottom" | "height" | "left" | "width", string> & { position: "absolute" } => {
  const { anchorMax, anchorMin, size } = rect;
  const { offsetMin } = computeRectOffsets(rect);
  const [left, width] = toAxis(
    anchorMin[0],
    anchorMax[0],
    offsetMin[0],
    size[0],
    isOnCanvas ? "(100% - 2 * var(--canvas-inset))" : "100%",
    isOnCanvas ? "var(--canvas-inset)" : "0px",
  );
  const [bottom, height] = toAxis(anchorMin[1], anchorMax[1], offsetMin[1], size[1], "100%", "0px");
  return { bottom, height, left, position: "absolute", width };
};
