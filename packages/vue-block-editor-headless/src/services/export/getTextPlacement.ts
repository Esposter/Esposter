import type { TextPlacement } from "#src/models/export/TextPlacement";
import type { PositionedElement } from "#src/models/PositionedElement";

import { TextAnchor } from "#src/models/export/TextAnchor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ARROW_LABEL_WIDTH } from "#src/services/constants";
import { getRouteMidpoint } from "#src/services/export/getRouteMidpoint";
import { getArrowRoute } from "#src/services/getArrowRoute";
import { exhaustiveGuard } from "@esposter/shared";

// Where an element's text is drawn, for the export and the editor alike
// An arrow's label sits at its route's midpoint, a shape's or a sticky note's is centred in its box, and a text box's hangs from its corner
// Each wraps at the width of its box, and an arrow's label wraps at a constant width. Undefined for an image or a stroke, which hold no text
export const getTextPlacement = (element: PositionedElement): TextPlacement | undefined => {
  switch (element.type) {
    case PositionedElementType.Arrow:
      return {
        point: getRouteMidpoint(getArrowRoute(element)),
        textAnchor: TextAnchor.Middle,
        width: ARROW_LABEL_WIDTH,
      };
    case PositionedElementType.Image:
    case PositionedElementType.Stroke:
      return undefined;
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
      return {
        point: { x: element.x + element.width / 2, y: element.y + element.height / 2 },
        textAnchor: TextAnchor.Middle,
        width: element.width,
      };
    case PositionedElementType.Text:
      return { point: { x: element.x, y: element.y }, textAnchor: TextAnchor.Start, width: element.width };
    default:
      return exhaustiveGuard(element);
  }
};
