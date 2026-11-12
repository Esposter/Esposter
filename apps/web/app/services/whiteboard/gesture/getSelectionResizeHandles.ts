import type { Bounds, PositionedDocument } from "vue-block-editor-headless";

import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { getResizedSides } from "@/services/whiteboard/gesture/getResizedSides";
import { getSelectionBounds } from "@/services/whiteboard/gesture/getSelectionBounds";
import { takeOne } from "@esposter/shared";
import { checkIsResizablePositionedElement, PositionedElementType } from "vue-block-editor-headless";

// Every handle, corners first, so a press where a corner and an edge overlap grabs the corner
const ALL_RESIZE_HANDLES = [
  ResizeHandle.BottomRight,
  ResizeHandle.TopLeft,
  ResizeHandle.Bottom,
  ResizeHandle.Top,
  ResizeHandle.Right,
  ResizeHandle.Left,
];

// The handles one selected element takes: none for an arrow or a stroke, which hold no size of their own, and only the left and right ones for
// A text box, whose height its text sets. A selection of several takes every handle
const getTakenResizeHandles = (document: PositionedDocument, selectedIds: string[]): ResizeHandle[] => {
  if (selectedIds.length !== 1) return ALL_RESIZE_HANDLES;

  const index = getElementIndexById(document, takeOne(selectedIds));
  if (index === undefined) return [];

  const element = takeOne(document.elements, index);
  if (!checkIsResizablePositionedElement(element)) return [];

  return element.type === PositionedElementType.Text ? [ResizeHandle.Left, ResizeHandle.Right] : ALL_RESIZE_HANDLES;
};

// A handle is left out when the box has no extent along the sides it moves, since a box with no height has no ratio to scale its height by
const checkHasHandleExtent = ({ height, width }: Bounds, handle: ResizeHandle): boolean => {
  const sides = getResizedSides(handle);
  const isHorizontal = sides.left || sides.right;
  const isVertical = sides.bottom || sides.top;
  return (!isHorizontal || width > 0) && (!isVertical || height > 0);
};

// The handles a selection shows around its box, corners first. A handle is shown only when the box has the extent it moves along
export const getSelectionResizeHandles = (document: PositionedDocument, selectedIds: string[]): ResizeHandle[] => {
  const bounds = getSelectionBounds(document, selectedIds);
  if (bounds === undefined) return [];

  return getTakenResizeHandles(document, selectedIds).filter((handle) => checkHasHandleExtent(bounds, handle));
};
