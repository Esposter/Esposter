import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "headless-block-editor";

import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import { MINIMUM_ELEMENT_SIZE } from "@/services/whiteboard/gesture/constants";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { exhaustiveGuard, takeOne } from "@esposter/shared";
import {
  getElementBounds,
  GRID_SIZE,
  resizePositionedElement,
  resizePositionedElementBounds,
  snapToGrid,
} from "headless-block-editor";

// The operations that resize an element by a delta from the handle a press grabbed, down to the least size. A bottom-right resize sets the size,
// And a top-left resize moves the start so the bottom-right corner holds still. With snap on, each edge a resize moves lands on the grid. Each
// Arrow bound to a resized shape is rerouted in the same edit
export const getResizeOperations = (
  document: PositionedDocument,
  elementId: string,
  handle: ResizeHandle,
  delta: Point,
  isSnapEnabled: boolean,
): JsonPatchOperation[] => {
  const index = getElementIndexById(document, elementId);
  if (index === undefined) return [];

  const { height, width, x, y } = getElementBounds(takeOne(document.elements, index));
  // The position an edge moves to, which with snap on is the grid line it snaps to
  const getTargetEdge = (edge: number, travel: number) =>
    isSnapEnabled ? snapToGrid(edge + travel, GRID_SIZE) : edge + travel;
  // The edge a minimum size allows, moved to the grid line that keeps the size at least the minimum with snap on
  const getLeastEdge = (edge: number) => (isSnapEnabled ? Math.ceil(edge / GRID_SIZE) * GRID_SIZE : edge);
  const getGreatestEdge = (edge: number) => (isSnapEnabled ? Math.floor(edge / GRID_SIZE) * GRID_SIZE : edge);
  switch (handle) {
    case ResizeHandle.BottomRight: {
      const bottom = Math.max(getTargetEdge(y + height, delta.y), getLeastEdge(y + MINIMUM_ELEMENT_SIZE));
      const right = Math.max(getTargetEdge(x + width, delta.x), getLeastEdge(x + MINIMUM_ELEMENT_SIZE));
      return resizePositionedElement(document, index, { height: bottom - y, width: right - x });
    }
    case ResizeHandle.TopLeft: {
      const left = Math.min(getTargetEdge(x, delta.x), getGreatestEdge(x + width - MINIMUM_ELEMENT_SIZE));
      const top = Math.min(getTargetEdge(y, delta.y), getGreatestEdge(y + height - MINIMUM_ELEMENT_SIZE));
      return resizePositionedElementBounds(document, index, {
        height: y + height - top,
        width: x + width - left,
        x: left,
        y: top,
      });
    }
    default:
      return exhaustiveGuard(handle);
  }
};
