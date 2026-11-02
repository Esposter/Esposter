import type { Viewport } from "@/models/whiteboard/Viewport";
import type { Point } from "headless-block-editor";

import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { getClampedScale } from "@/services/whiteboard/viewport/getClampedScale";

// A viewport zoomed by a factor, keeping the document point under a screen point where it was, so the zoom holds what the pointer is on
export const getZoomedViewport = (viewport: Viewport, factor: number, screen: Point): Viewport => {
  const scale = getClampedScale(viewport.scale * factor);
  const anchor = getWorldPoint(screen, viewport);
  return { scale, x: anchor.x - screen.x / scale, y: anchor.y - screen.y / scale };
};
