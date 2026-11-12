import type { Point, PositionedElement } from "vue-block-editor-headless";

import { getDuplicateArrowEnd } from "@/services/whiteboard/edit/getDuplicateArrowEnd";
import { exhaustiveGuard, takeOne } from "@esposter/shared";
import { PositionedElementType } from "vue-block-editor-headless";

// A copy of an element under the id its original maps to, moved by the offset. An arrow's ends follow the copies of the shapes they are bound to
export const getDuplicateElement = (
  element: PositionedElement,
  originalIdCopyIdMap: Record<string, string>,
  offset: Point,
): PositionedElement => {
  const id = takeOne(originalIdCopyIdMap, element.id);
  switch (element.type) {
    case PositionedElementType.Arrow:
      return {
        ...element,
        end: getDuplicateArrowEnd(element.end, originalIdCopyIdMap, offset),
        id,
        start: getDuplicateArrowEnd(element.start, originalIdCopyIdMap, offset),
      };
    case PositionedElementType.Image:
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
    case PositionedElementType.Text:
      return { ...element, id, x: element.x + offset.x, y: element.y + offset.y };
    case PositionedElementType.Stroke:
      return { ...element, id, points: element.points.map(({ x, y }) => ({ x: x + offset.x, y: y + offset.y })) };
    default:
      return exhaustiveGuard(element);
  }
};
