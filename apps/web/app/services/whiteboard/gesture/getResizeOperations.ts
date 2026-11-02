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
  // The travel an edge makes from its position, which with snap on is the travel that lands the edge on the grid
  const getEdgeTravel = (edge: number, travel: number) =>
    isSnapEnabled ? snapToGrid(edge + travel, GRID_SIZE) - edge : travel;
  switch (handle) {
    case ResizeHandle.BottomRight:
      return resizePositionedElement(document, index, {
        height: Math.max(MINIMUM_ELEMENT_SIZE, height + getEdgeTravel(y + height, delta.y)),
        width: Math.max(MINIMUM_ELEMENT_SIZE, width + getEdgeTravel(x + width, delta.x)),
      });
    case ResizeHandle.TopLeft: {
      const left = Math.min(x + getEdgeTravel(x, delta.x), x + width - MINIMUM_ELEMENT_SIZE);
      const top = Math.min(y + getEdgeTravel(y, delta.y), y + height - MINIMUM_ELEMENT_SIZE);
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
