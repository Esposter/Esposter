import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { getResizeHandlePoint } from "@/services/whiteboard/gesture/getResizeHandlePoint";
import { getSelectionBounds } from "@/services/whiteboard/gesture/getSelectionBounds";
import { getSelectionResizeHandles } from "@/services/whiteboard/gesture/getSelectionResizeHandles";

// The handle of the selection a point lands on, corners first, or undefined when it lands on none of the selection's handles
export const getResizeHandle = (
  document: PositionedDocument,
  selectedIds: string[],
  point: Point,
  tolerance: number,
): ResizeHandle | undefined => {
  const bounds = getSelectionBounds(document, selectedIds);
  if (bounds === undefined) return undefined;

  return getSelectionResizeHandles(document, selectedIds).find(
    (handle) => getPointDistance(point, getResizeHandlePoint(bounds, handle)) <= tolerance,
  );
};
