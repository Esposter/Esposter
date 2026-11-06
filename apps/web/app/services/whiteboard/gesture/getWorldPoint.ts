import type { Viewport } from "@/models/whiteboard/Viewport";
import type { Point } from "vue-block-editor-headless";

// The document point under a screen point, read through the viewport's origin and scale
export const getWorldPoint = (screen: Point, viewport: Viewport): Point => ({
  x: viewport.x + screen.x / viewport.scale,
  y: viewport.y + screen.y / viewport.scale,
});
