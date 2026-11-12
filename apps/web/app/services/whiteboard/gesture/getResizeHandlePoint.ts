import type { Bounds, Point } from "vue-block-editor-headless";

import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import { exhaustiveGuard } from "@esposter/shared";

// The point a resize handle sits at on a box: a corner, or the middle of an edge
export const getResizeHandlePoint = ({ height, width, x, y }: Bounds, handle: ResizeHandle): Point => {
  switch (handle) {
    case ResizeHandle.Bottom:
      return { x: x + width / 2, y: y + height };
    case ResizeHandle.BottomRight:
      return { x: x + width, y: y + height };
    case ResizeHandle.Left:
      return { x, y: y + height / 2 };
    case ResizeHandle.Right:
      return { x: x + width, y: y + height / 2 };
    case ResizeHandle.Top:
      return { x: x + width / 2, y };
    case ResizeHandle.TopLeft:
      return { x, y };
    default:
      return exhaustiveGuard(handle);
  }
};
