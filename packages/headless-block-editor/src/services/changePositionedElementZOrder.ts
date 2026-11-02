import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { JsonPatchOperationType } from "@esposter/shared";

// Moves the element at one index to another, which is its z-order, or no operations when either index names no element
export const changePositionedElementZOrder = (
  document: PositionedDocument,
  fromIndex: number,
  toIndex: number,
): JsonPatchOperation[] => {
  if (fromIndex === toIndex || !getPositionedElement(document, fromIndex) || !getPositionedElement(document, toIndex))
    return [];
  return [{ from: getElementPointer(fromIndex), op: JsonPatchOperationType.Move, path: getElementPointer(toIndex) }];
};
