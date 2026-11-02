import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { PositionedElement } from "#src/models/PositionedElement";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { getBindableShape } from "#src/services/getBindableShape";
import { getElementPointer } from "#src/services/getElementPointer";
import { JsonPatchOperationType } from "@esposter/shared";

// Adds an element at an index of the element list, or no operations when an arrow end binds no shape the document can bind it to
export const insertPositionedElement = (
  document: PositionedDocument,
  index: number,
  element: PositionedElement,
): JsonPatchOperation[] => {
  if (
    element.type === PositionedElementType.Arrow &&
    ![element.start, element.end].every(
      (arrowEnd) => arrowEnd.binding === undefined || getBindableShape(document.elements, arrowEnd.binding),
    )
  )
    return [];
  return [{ op: JsonPatchOperationType.Add, path: getElementPointer(index), value: element }];
};
