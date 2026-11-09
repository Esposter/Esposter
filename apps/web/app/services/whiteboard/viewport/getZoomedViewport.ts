import type { Viewport } from "@/models/whiteboard/Viewport";
import type { Point } from "vue-block-editor-headless";

import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { getClampedScale } from "@/services/whiteboard/viewport/getClampedScale";

// A viewport zoomed to a scale, keeping the document point under a screen point where it was, so the zoom holds what the pointer is on
export const getZoomedViewport = (viewport: Viewport, scale: number, screen: Point): Viewport => {
  const clampedScale = getClampedScale(scale);
  const anchor = getWorldPoint(screen, viewport);
  return { scale: clampedScale, x: anchor.x - screen.x / clampedScale, y: anchor.y - screen.y / clampedScale };
};
