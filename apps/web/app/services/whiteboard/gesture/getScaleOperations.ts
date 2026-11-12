import type { JsonPatchOperation } from "@esposter/shared";
import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getChainedOperations } from "@/services/whiteboard/edit/getChainedOperations";
import { MINIMUM_ELEMENT_SIZE } from "@/services/whiteboard/gesture/constants";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { getResizedSides } from "@/services/whiteboard/gesture/getResizedSides";
import { getSelectionBounds } from "@/services/whiteboard/gesture/getSelectionBounds";
import { exhaustiveGuard, JsonPatchOperationType, takeOne } from "@esposter/shared";
import {
  ArrowEndKey,
  checkIsResizablePositionedElement,
  getElementBounds,
  getElementPointer,
  PositionedElementType,
  resizePositionedElementBounds,
} from "vue-block-editor-headless";

// The change in the box's extent on an axis that the sides a handle moves make: the end side moves with the travel, and the start side against it
const getExtentChange = (isStartMoved: boolean, isEndMoved: boolean, travel: number): number => {
  if (isEndMoved) return travel;
  return isStartMoved ? -travel : 0;
};

// The extent the scale on an axis stops at, the smallest of the elements that take a size on it, or the box's own extent when none does
const getLimitingExtent = (extents: number[], boxExtent: number): number =>
  extents.length === 0 ? boxExtent : extents.reduce((smallest, extent) => Math.min(smallest, extent));

// The factor an axis scales the selection by. It stops where the smallest element reaches the minimum size, and an axis of no extent, or one no side
// Of the handle moves on, takes no scale
const getAxisScale = (extent: number, extentChange: number, limitingExtent: number): number => {
  if (extent === 0 || extentChange === 0) return 1;

  const minimumScale = Math.min(1, MINIMUM_ELEMENT_SIZE / limitingExtent);
  return Math.max(minimumScale, (extent + extentChange) / extent);
};

// A coordinate scaled about the anchor, which a scale of one leaves as it is, so an axis that is not scaled keeps its exact value
const getScaledValue = (value: number, anchor: number, scale: number): number =>
  scale === 1 ? value : anchor + (value - anchor) * scale;

// The operations that scale one element of a selection about the anchor, by a factor on each axis. A box scales its position and its size, a stroke
// Scales its points, and an arrow scales each end that is free, since a bound end follows its shape through the reroute the resize makes
const getScaleElementOperations = (
  document: PositionedDocument,
  elementId: string,
  anchor: Point,
  scale: { x: number; y: number },
): JsonPatchOperation[] => {
  const index = getElementIndexById(document, elementId);
  if (index === undefined) return [];

  const element = takeOne(document.elements, index);
  const pointer = getElementPointer(index);
  const getScaledPoint = ({ x, y }: Point): Point => ({
    x: getScaledValue(x, anchor.x, scale.x),
    y: getScaledValue(y, anchor.y, scale.y),
  });
  switch (element.type) {
    case PositionedElementType.Arrow:
      return [ArrowEndKey.Start, ArrowEndKey.End]
        .filter((arrowEndKey) => element[arrowEndKey].binding === undefined)
        .map((arrowEndKey) => ({
          op: JsonPatchOperationType.Replace,
          path: `${pointer}/${arrowEndKey}/point`,
          value: getScaledPoint(element[arrowEndKey].point),
        }));
    case PositionedElementType.Stroke:
      return [
        {
          op: JsonPatchOperationType.Replace,
          path: `${pointer}/points`,
          value: element.points.map((strokePoint) => getScaledPoint(strokePoint)),
        },
      ];
    case PositionedElementType.Image:
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
    case PositionedElementType.Text: {
      const { height, width, x, y } = getElementBounds(element);
      return resizePositionedElementBounds(document, index, {
        height: height * scale.y,
        width: width * scale.x,
        x: getScaledValue(x, anchor.x, scale.x),
        y: getScaledValue(y, anchor.y, scale.y),
      });
    }
    default:
      return exhaustiveGuard(element);
  }
};

// The operations that scale each element of a selection by a drag of one handle of the selection's box, in one list. The side opposite the handle
// Holds still, so each element keeps its place relative to it. A text box stores no height, so only its width scales with a drag along its height
export const getScaleOperations = (
  document: PositionedDocument,
  elementIds: string[],
  handle: ResizeHandle,
  delta: Point,
): JsonPatchOperation[] => {
  const bounds = getSelectionBounds(document, elementIds);
  if (bounds === undefined) return [];

  const sides = getResizedSides(handle);
  const sizedElements = document.elements
    .filter((element) => elementIds.includes(element.id) && checkIsResizablePositionedElement(element))
    .map((element) => ({ bounds: getElementBounds(element), type: element.type }));
  const widths = sizedElements.map(({ bounds: elementBounds }) => elementBounds.width);
  const heights = sizedElements
    .filter(({ type }) => type !== PositionedElementType.Text)
    .map(({ bounds: elementBounds }) => elementBounds.height);
  const scale = {
    x: getAxisScale(
      bounds.width,
      getExtentChange(sides.left, sides.right, delta.x),
      getLimitingExtent(widths, bounds.width),
    ),
    y: getAxisScale(
      bounds.height,
      getExtentChange(sides.top, sides.bottom, delta.y),
      getLimitingExtent(heights, bounds.height),
    ),
  };
  const anchor: Point = {
    x: sides.left ? bounds.x + bounds.width : bounds.x,
    y: sides.top ? bounds.y + bounds.height : bounds.y,
  };
  return getChainedOperations(document, elementIds, (chainedDocument, elementId) =>
    getScaleElementOperations(chainedDocument, elementId, anchor, scale),
  );
};
