import type { PositionedElement } from "#src/models/PositionedElement";
import type { PositionedElementProperty } from "#src/models/PositionedElementProperty";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { exhaustiveGuard } from "@esposter/shared";

// Whether an element holds a property a change sets: a colour every element but an image holds, a width an outline or a stroke holds, a dash
// Pattern and a sketch level an outline or a route holds, a fill a shape or a sticky note holds, corners a shape holds but an ellipse does not, and a route
// Or an arrowhead an arrow holds. A text's size is held by every element with text, a horizontal alignment by a shape, a sticky note or a text box, a vertical
// Alignment by a shape or a sticky note, the wrap by a text box alone, and the alt text by an image alone
export const checkIsPositionedElementPropertyHeld = (
  element: PositionedElement,
  property: PositionedElementProperty["property"],
): boolean => {
  switch (property) {
    case "altText":
      return element.type === PositionedElementType.Image;
    case "arrowhead":
    case "pathKind":
      return element.type === PositionedElementType.Arrow;
    case "color":
      return element.type !== PositionedElementType.Image;
    case "cornerStyle":
      return element.type === PositionedElementType.Shape && element.kind !== ShapeKind.Ellipse;
    case "dashPattern":
    case "sketchLevel":
      return (
        element.type === PositionedElementType.Arrow ||
        element.type === PositionedElementType.Shape ||
        element.type === PositionedElementType.StickyNote
      );
    case "fill":
      return element.type === PositionedElementType.Shape || element.type === PositionedElementType.StickyNote;
    case "horizontalAlignment":
      return (
        element.type === PositionedElementType.Shape ||
        element.type === PositionedElementType.StickyNote ||
        element.type === PositionedElementType.Text
      );
    case "isWrapped":
      return element.type === PositionedElementType.Text;
    case "strokeWidth":
      return element.type !== PositionedElementType.Image && element.type !== PositionedElementType.Text;
    case "textSize":
      return element.type !== PositionedElementType.Image && element.type !== PositionedElementType.Stroke;
    case "verticalAlignment":
      return element.type === PositionedElementType.Shape || element.type === PositionedElementType.StickyNote;
    default:
      return exhaustiveGuard(property);
  }
};
