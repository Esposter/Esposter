import type { Point, ShapeElement } from "vue-block-editor-headless";

import { WHITEBOARD_CONNECTION_HANDLE_GAP } from "@/services/whiteboard/overlay/constants";
import { getConnectionPoint, getElementBounds } from "vue-block-editor-headless";

// The point a connection handle sits at: the shape's connection point, pushed outward from the shape's centre by the handle gap, so the handle sits
// Clear of the resize handle on the frame at the same point. The gap is in screen pixels, so it is scaled to the zoom
export const getConnectionHandlePoint = (shape: ShapeElement, connectionIndex: number, scale: number): Point => {
  const bounds = getElementBounds(shape);
  const point = getConnectionPoint(bounds, connectionIndex);
  const centre = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const direction = { x: point.x - centre.x, y: point.y - centre.y };
  const length = Math.hypot(direction.x, direction.y);
  if (length === 0) return point;

  const gap = WHITEBOARD_CONNECTION_HANDLE_GAP / scale;
  return { x: point.x + (direction.x / length) * gap, y: point.y + (direction.y / length) * gap };
};
