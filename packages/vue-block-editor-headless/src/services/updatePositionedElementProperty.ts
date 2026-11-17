import type { ArrowElement } from "#src/models/ArrowElement";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { PositionedElementProperty } from "#src/models/PositionedElementProperty";
import type { TextElement } from "#src/models/TextElement";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { checkIsPositionedElementPropertyHeld } from "#src/services/checkIsPositionedElementPropertyHeld";
import { getAutoTextWidthOperation } from "#src/services/getAutoTextWidthOperation";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { JsonPatchOperationType } from "@esposter/shared";

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
  if (!element || !checkIsPositionedElementPropertyHeld(element, change.property)) return [];
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
