import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { ArrowEndKey, Point, PositionedDocument } from "vue-block-editor-headless";

import { getConnectionHandle } from "@/services/whiteboard/gesture/getConnectionHandle";
import { getFreeEndHandle } from "@/services/whiteboard/gesture/getFreeEndHandle";
import { getResizeHandle } from "@/services/whiteboard/gesture/getResizeHandle";

// A handle a press on the select tool lands on: a resize of the selection, a connection of a shape, or a drag of a free arrow end. Each one is
// The gesture the press starts, and a press on none falls through to the element or the canvas beneath it
export type PressedHandle =
  | { arrowId: string; endKey: ArrowEndKey; kind: "end" }
  | { connectionIndex: number; elementId: string; kind: "connection" }
  | { handle: ResizeHandle; kind: "resize" };

// The handle a press lands on, in the order the handles are drawn over each other: the resize handles on a selection's box first, then the connection
// Handles beyond its frame, then a free arrow end on the arrow's own line
export const getPressedHandle = (
  document: PositionedDocument,
  selectedIds: string[],
  point: Point,
  tolerance: number,
  scale: number,
): PressedHandle | undefined => {
  const handle = getResizeHandle(document, selectedIds, point, tolerance);
  if (handle !== undefined) return { handle, kind: "resize" };

  const connectionHandle = getConnectionHandle(document, selectedIds, point, tolerance, scale);
  if (connectionHandle !== undefined) return { ...connectionHandle, kind: "connection" };

  const freeEndHandle = getFreeEndHandle(document, selectedIds, point, tolerance);
  return freeEndHandle === undefined ? undefined : { ...freeEndHandle, kind: "end" };
};
