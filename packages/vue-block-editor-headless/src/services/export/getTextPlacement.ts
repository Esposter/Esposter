import type { Bounds } from "#src/models/Bounds";
import type { TextPlacement } from "#src/models/export/TextPlacement";
import type { PositionedElement } from "#src/models/PositionedElement";

import { TextAnchor } from "#src/models/export/TextAnchor";
import { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { VerticalAlignment } from "#src/models/VerticalAlignment";
import { ARROW_LABEL_WIDTH } from "#src/services/constants";
import { getRouteMidpoint } from "#src/services/export/getRouteMidpoint";
import { getArrowRoute } from "#src/services/getArrowRoute";
import { getHorizontalAlignment } from "#src/services/getHorizontalAlignment";
import { getVerticalAlignment } from "#src/services/getVerticalAlignment";
import { exhaustiveGuard } from "@esposter/shared";

// The side of a box a text is anchored at by its horizontal alignment, and the anchor the text is drawn from at that side
const getHorizontalAnchor = (
  { width, x }: Bounds,
  horizontalAlignment: HorizontalAlignment,
): { textAnchor: TextAnchor; x: number } => {
  switch (horizontalAlignment) {
    case HorizontalAlignment.Center:
      return { textAnchor: TextAnchor.Middle, x: x + width / 2 };
    case HorizontalAlignment.Left:
      return { textAnchor: TextAnchor.Start, x };
    case HorizontalAlignment.Right:
      return { textAnchor: TextAnchor.End, x: x + width };
    default:
      return exhaustiveGuard(horizontalAlignment);
  }
};

// The edge or the middle of a box a text is anchored at by its vertical alignment
const getVerticalAnchorY = ({ height, y }: Bounds, verticalAlignment: VerticalAlignment): number => {
  switch (verticalAlignment) {
    case VerticalAlignment.Bottom:
      return y + height;
    case VerticalAlignment.Middle:
      return y + height / 2;
    case VerticalAlignment.Top:
      return y;
    default:
      return exhaustiveGuard(verticalAlignment);
  }
};

// A text placed in a box by its alignments, which lays out at the box's width
const getBoxTextPlacement = (
  box: Bounds,
  horizontalAlignment: HorizontalAlignment,
  verticalAlignment: VerticalAlignment,
  { isWrapped, textSize }: Pick<TextPlacement, "isWrapped" | "textSize">,
): TextPlacement => {
  const { textAnchor, x } = getHorizontalAnchor(box, horizontalAlignment);
  return {
    isWrapped,
    point: { x, y: getVerticalAnchorY(box, verticalAlignment) },
    textAnchor,
    textSize,
    verticalAlignment,
    width: box.width,
  };
};

// Where an element's text is drawn, for the export and the editor alike. An arrow's label sits at its route's midpoint, centred, and wraps at a constant width
// A shape's or a sticky note's sits in its box by its alignments, centred until one is set, and a text box's sits in its box by its alignments, from its left edge
// Until one is set. Undefined for an image or a stroke, which hold no text
export const getTextPlacement = (element: PositionedElement): TextPlacement | undefined => {
  switch (element.type) {
    case PositionedElementType.Arrow:
      return {
        isWrapped: true,
        point: getRouteMidpoint(getArrowRoute(element)),
        textAnchor: TextAnchor.Middle,
        textSize: element.textSize,
        verticalAlignment: VerticalAlignment.Middle,
        width: ARROW_LABEL_WIDTH,
      };
    case PositionedElementType.Image:
    case PositionedElementType.Stroke:
      return undefined;
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
      return getBoxTextPlacement(element, getHorizontalAlignment(element), getVerticalAlignment(element), {
        isWrapped: true,
        textSize: element.textSize,
      });
    case PositionedElementType.Text:
      // A text box has no height of its own, and its text hangs from its top edge, so the height is not read
      return getBoxTextPlacement(
        { height: 0, width: element.width, x: element.x, y: element.y },
        getHorizontalAlignment(element),
        VerticalAlignment.Top,
        { isWrapped: element.isWrapped, textSize: element.textSize },
      );
    default:
      return exhaustiveGuard(element);
  }
};
