import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { MINIMUM_ELEMENT_SIZE } from "@/services/whiteboard/gesture/constants";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { getResizedSides } from "@/services/whiteboard/gesture/getResizedSides";
import { takeOne } from "@esposter/shared";
import { getElementBounds, resizePositionedElement, resizePositionedElementBounds } from "vue-block-editor-headless";

// The operations that resize an element by a delta from the handle a press grabbed, down to the least size. A side the handle moves follows the
// Delta, and a side it does not move holds still. A handle that moves the start of the box also moves its position. Each arrow bound to a resized
// Shape is rerouted in the same edit
export const getResizeOperations = (
  document: PositionedDocument,
  elementId: string,
  handle: ResizeHandle,
  delta: Point,
): JsonPatchOperation[] => {
  const index = getElementIndexById(document, elementId);
  if (index === undefined) return [];

  const { height, width, x, y } = getElementBounds(takeOne(document.elements, index));
  const sides = getResizedSides(handle);
  const left = sides.left ? Math.min(x + delta.x, x + width - MINIMUM_ELEMENT_SIZE) : x;
  const right = sides.right ? Math.max(x + width + delta.x, x + MINIMUM_ELEMENT_SIZE) : x + width;
  const top = sides.top ? Math.min(y + delta.y, y + height - MINIMUM_ELEMENT_SIZE) : y;
  const bottom = sides.bottom ? Math.max(y + height + delta.y, y + MINIMUM_ELEMENT_SIZE) : y + height;
  const size = { height: bottom - top, width: right - left };
  return sides.left || sides.top
    ? resizePositionedElementBounds(document, index, { ...size, x: left, y: top })
    : resizePositionedElement(document, index, size);
};
