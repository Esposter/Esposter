import type { Bounds } from "#src/models/Bounds";
import type { PositionedElement } from "#src/models/PositionedElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { TEXT_LINE_HEIGHT } from "#src/services/export/constants";
import { getWrappedLines } from "#src/services/export/getWrappedLines";
import { getArrowRoute } from "#src/services/getArrowRoute";
import { getPointsBounds } from "#src/services/getPointsBounds";
import { exhaustiveGuard } from "@esposter/shared";

// An element's bounds: its box, the box its route covers for an arrow, and the box its points cover for a stroke.
// A text box stores no height, so its height is the number of lines its text wraps to, each one a line high
export const getElementBounds = (element: PositionedElement): Bounds => {
  switch (element.type) {
    case PositionedElementType.Arrow:
      return getPointsBounds(getArrowRoute(element));
    case PositionedElementType.Image:
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
      return { height: element.height, width: element.width, x: element.x, y: element.y };
    case PositionedElementType.Stroke:
      return getPointsBounds(element.points);
    case PositionedElementType.Text:
      return {
        height: getWrappedLines(element.text, element.width).length * TEXT_LINE_HEIGHT,
        width: element.width,
        x: element.x,
        y: element.y,
      };
    default:
      return exhaustiveGuard(element);
  }
};
