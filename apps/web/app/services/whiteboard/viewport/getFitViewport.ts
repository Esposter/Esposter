import type { Viewport } from "@/models/whiteboard/Viewport";
import type { Bounds, Size } from "vue-block-editor-headless";

import { WHITEBOARD_FIT_MAX_SCALE } from "@/services/whiteboard/viewport/constants";
import { getClampedScale } from "@/services/whiteboard/viewport/getClampedScale";

// The viewport that shows a box of the document entirely within a canvas of a size, centred on the box. A fit never enlarges the
// Box past its own size, so a small document sits at full size rather than filling the canvas
export const getFitViewport = (bounds: Bounds, size: Size): Viewport => {
  const scale = getClampedScale(
    Math.min(WHITEBOARD_FIT_MAX_SCALE, size.width / bounds.width, size.height / bounds.height),
  );
  return {
    scale,
    x: bounds.x + bounds.width / 2 - size.width / (2 * scale),
    y: bounds.y + bounds.height / 2 - size.height / (2 * scale),
  };
};
