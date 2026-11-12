import type { ArrowElement } from "#src/models/ArrowElement";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { PositionedElement } from "#src/models/PositionedElement";
import type { PositionedElementProperty } from "#src/models/PositionedElementProperty";
import type { TextElement } from "#src/models/TextElement";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { getAutoTextWidthOperation } from "#src/services/getAutoTextWidthOperation";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { exhaustiveGuard, JsonPatchOperationType } from "@esposter/shared";

// Whether an element holds the property a change sets: a colour every element but an image holds, a width an outline or a stroke holds, a dash
// Pattern and a sketch level an outline or a route holds, a fill a shape or a sticky note holds, corners a shape holds but an ellipse does not, and a route
// Or an arrowhead an arrow holds. A text's size is held by every element with text, a horizontal alignment by a shape, a sticky note or a text box, a vertical
// Alignment by a shape or a sticky note, the wrap by a text box alone, and the alt text by an image alone
const checkIsHeld = (element: PositionedElement, change: PositionedElementProperty): boolean => {
  switch (change.property) {
    case "altText":
      return element.type === PositionedElementType.Image;
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
    case "arrowhead":
    case "pathKind":
      return element.type === PositionedElementType.Arrow;
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
      return exhaustiveGuard(change);
  }
};

// Sets or clears the arrowhead at one end of an arrow. An end with no arrowhead has nothing to clear, so clearing it changes nothing
const getArrowheadOperations = (
  index: number,
  arrow: ArrowElement,
  change: Extract<PositionedElementProperty, { property: "arrowhead" }>,
): JsonPatchOperation[] => {
  const arrowheadPointer = `${getElementPointer(index)}/${change.end}/arrowhead`;
  const isSet = arrow[change.end].arrowhead !== undefined;
  if (change.value === undefined) return isSet ? [{ op: JsonPatchOperationType.Remove, path: arrowheadPointer }] : [];

  return [
    {
      op: isSet ? JsonPatchOperationType.Replace : JsonPatchOperationType.Add,
      path: arrowheadPointer,
      value: change.value,
    },
  ];
};

// An unwrapped text box is as wide as its widest line at its size, so a change to its wrap or its size sets that width in the same edit. A wrapped
// Text keeps the width it has, and a change to any other property sets none
const getTextWidthOperations = (
  index: number,
  element: TextElement,
  change: PositionedElementProperty,
): JsonPatchOperation[] => {
  if (change.property !== "isWrapped" && change.property !== "textSize") return [];

  const isWrapped = change.property === "isWrapped" ? change.value : element.isWrapped;
  if (isWrapped) return [];

  const textSize = change.property === "textSize" ? change.value : element.textSize;
  return [getAutoTextWidthOperation(index, element.text, textSize)];
};

// Replaces one property of the element at an index, as the change names it, and for an unwrapped text box the width its text takes
// No operations for a property the element does not hold, or for an index that names no element
export const updatePositionedElementProperty = (
  document: PositionedDocument,
  index: number,
  change: PositionedElementProperty,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element || !checkIsHeld(element, change)) return [];
  if (element.type === PositionedElementType.Arrow && change.property === "arrowhead")
    return getArrowheadOperations(index, element, change);

  // An alignment an element has not set is absent from the document, so the first one is added, and a later one replaces it
  const isAbsentUntilSet = change.property === "horizontalAlignment" || change.property === "verticalAlignment";
  const operations: JsonPatchOperation[] = [
    {
      op: isAbsentUntilSet ? JsonPatchOperationType.Add : JsonPatchOperationType.Replace,
      path: `${getElementPointer(index)}/${change.property}`,
      value: change.value,
    },
  ];
  return element.type === PositionedElementType.Text
    ? [...operations, ...getTextWidthOperations(index, element, change)]
    : operations;
};
