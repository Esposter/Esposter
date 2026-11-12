import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { PositionedElement } from "#src/models/PositionedElement";
import type { PositionedElementProperty } from "#src/models/PositionedElementProperty";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { exhaustiveGuard, JsonPatchOperationType } from "@esposter/shared";

// Whether an element holds the property a change sets: a colour every element but an image holds, a width an outline or a stroke holds, a dash
// Pattern an outline or a route holds, a fill a shape or a sticky note holds, and a route or an arrowhead an arrow holds
const checkIsHeld = (element: PositionedElement, change: PositionedElementProperty): boolean => {
  switch (change.property) {
    case "color":
      return element.type !== PositionedElementType.Image;
    case "dashPattern":
      return (
        element.type === PositionedElementType.Arrow ||
        element.type === PositionedElementType.Shape ||
        element.type === PositionedElementType.StickyNote
      );
    case "fill":
      return element.type === PositionedElementType.Shape || element.type === PositionedElementType.StickyNote;
    case "hasArrowhead":
    case "pathKind":
      return element.type === PositionedElementType.Arrow;
    case "strokeWidth":
      return element.type !== PositionedElementType.Image && element.type !== PositionedElementType.Text;
    default:
      return exhaustiveGuard(change);
  }
};

// Replaces one property of the element at an index, as the change names it
// No operations for a property the element does not hold, or for an index that names no element
export const updatePositionedElementProperty = (
  document: PositionedDocument,
  index: number,
  change: PositionedElementProperty,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element || !checkIsHeld(element, change)) return [];

  const propertyPath = change.property === "hasArrowhead" ? `${change.end}/hasArrowhead` : change.property;
  return [
    { op: JsonPatchOperationType.Replace, path: `${getElementPointer(index)}/${propertyPath}`, value: change.value },
  ];
};
