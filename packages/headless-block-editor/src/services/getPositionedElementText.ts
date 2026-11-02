import type { PositionedElement } from "#src/models/PositionedElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { exhaustiveGuard } from "@esposter/shared";

// The text an element holds: an arrow's label, or a shape's, a text box's or a sticky note's text. An image or a stroke holds none, so it reads as undefined
export const getPositionedElementText = (element: PositionedElement): string | undefined => {
  switch (element.type) {
    case PositionedElementType.Arrow:
      return element.label;
    case PositionedElementType.Image:
    case PositionedElementType.Stroke:
      return undefined;
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
    case PositionedElementType.Text:
      return element.text;
    default:
      return exhaustiveGuard(element);
  }
};
