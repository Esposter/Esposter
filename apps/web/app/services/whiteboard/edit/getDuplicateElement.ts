import type { PositionedElement } from "headless-block-editor";

import { WHITEBOARD_DUPLICATE_OFFSET } from "@/services/whiteboard/edit/constants";
import { getDuplicateArrowEnd } from "@/services/whiteboard/edit/getDuplicateArrowEnd";
import { exhaustiveGuard, takeOne } from "@esposter/shared";
import { PositionedElementType } from "headless-block-editor";

// A copy of an element under the id its original maps to, moved by the duplicate offset. An arrow's ends follow the copies of the shapes they are bound to
export const getDuplicateElement = (
  element: PositionedElement,
  originalIdCopyIdMap: Record<string, string>,
): PositionedElement => {
  const id = takeOne(originalIdCopyIdMap, element.id);
  switch (element.type) {
    case PositionedElementType.Arrow:
      return {
        ...element,
        end: getDuplicateArrowEnd(element.end, originalIdCopyIdMap),
        id,
        start: getDuplicateArrowEnd(element.start, originalIdCopyIdMap),
      };
    case PositionedElementType.Image:
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
    case PositionedElementType.Text:
      return { ...element, id, x: element.x + WHITEBOARD_DUPLICATE_OFFSET, y: element.y + WHITEBOARD_DUPLICATE_OFFSET };
    case PositionedElementType.Stroke:
      return {
        ...element,
        id,
        points: element.points.map(({ x, y }) => ({
          x: x + WHITEBOARD_DUPLICATE_OFFSET,
          y: y + WHITEBOARD_DUPLICATE_OFFSET,
        })),
      };
    default:
      return exhaustiveGuard(element);
  }
};
