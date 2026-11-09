import type { GestureWheelEvent } from "@/models/whiteboard/GestureWheelEvent";
import type { Viewport } from "@/models/whiteboard/Viewport";

import { WHITEBOARD_WHEEL_ZOOM_RATE } from "@/services/whiteboard/viewport/constants";
import { getZoomedViewport } from "@/services/whiteboard/viewport/getZoomedViewport";

// The viewport a wheel turn leaves. A plain wheel pans it by the turn, in screen pixels at the viewport's scale. A wheel with Ctrl or Cmd
// Held, which a trackpad pinch also is, zooms about the pointer by a factor that grows with the turn
export const getWheelViewport = (viewport: Viewport, event: GestureWheelEvent): Viewport => {
  if (!event.isZoomKey)
    return {
      scale: viewport.scale,
      x: viewport.x + event.deltaX / viewport.scale,
      y: viewport.y + event.deltaY / viewport.scale,
    };
  const factor = Math.exp(-event.deltaY * WHITEBOARD_WHEEL_ZOOM_RATE);
  return getZoomedViewport(viewport, viewport.scale * factor, event.screen);
};
