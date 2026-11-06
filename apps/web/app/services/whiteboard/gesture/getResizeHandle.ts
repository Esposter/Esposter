import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { takeOne } from "@esposter/shared";
import { checkIsResizablePositionedElement, getElementBounds } from "vue-block-editor-headless";

// The handle of the one selected element whose corner the point hits, when exactly one element is selected and it can be resized
export const getResizeHandle = (
  document: PositionedDocument,
  selectedIds: string[],
  point: Point,
  tolerance: number,
): ResizeHandle | undefined => {
  if (selectedIds.length !== 1) return undefined;

  const index = getElementIndexById(document, takeOne(selectedIds));
  if (index === undefined) return undefined;

  const element = takeOne(document.elements, index);
  if (!checkIsResizablePositionedElement(element)) return undefined;

  const { height, width, x, y } = getElementBounds(element);
  if (getPointDistance(point, { x: x + width, y: y + height }) <= tolerance) return ResizeHandle.BottomRight;

  return getPointDistance(point, { x, y }) <= tolerance ? ResizeHandle.TopLeft : undefined;
};
