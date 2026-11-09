import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import { MINIMUM_ELEMENT_SIZE } from "@/services/whiteboard/gesture/constants";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { exhaustiveGuard, takeOne } from "@esposter/shared";
import { getElementBounds, resizePositionedElement, resizePositionedElementBounds } from "vue-block-editor-headless";

// The operations that resize an element by a delta from the handle a press grabbed, down to the least size. A bottom-right resize sets the size,
// And a top-left resize moves the start so the bottom-right corner holds still. Each arrow bound to a resized shape is rerouted in the same edit
export const getResizeOperations = (
  document: PositionedDocument,
  elementId: string,
  handle: ResizeHandle,
  delta: Point,
): JsonPatchOperation[] => {
  const index = getElementIndexById(document, elementId);
  if (index === undefined) return [];

  const { height, width, x, y } = getElementBounds(takeOne(document.elements, index));
  switch (handle) {
    case ResizeHandle.BottomRight: {
      const bottom = Math.max(y + height + delta.y, y + MINIMUM_ELEMENT_SIZE);
      const right = Math.max(x + width + delta.x, x + MINIMUM_ELEMENT_SIZE);
      return resizePositionedElement(document, index, { height: bottom - y, width: right - x });
    }
    case ResizeHandle.TopLeft: {
      const left = Math.min(x + delta.x, x + width - MINIMUM_ELEMENT_SIZE);
      const top = Math.min(y + delta.y, y + height - MINIMUM_ELEMENT_SIZE);
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
