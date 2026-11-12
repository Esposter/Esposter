import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { getAutoTextWidth } from "#src/services/export/getAutoTextWidth";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { getPositionedElementText } from "#src/services/getPositionedElementText";
import { JsonPatchOperationType } from "@esposter/shared";

// Replaces the text of the element at an index: the text of a shape, a text box or a sticky note, or the label of an arrow. An unwrapped text box is also
// As wide as its new widest line, in the same edit
// No operations for an image or a stroke, which hold no text, or for an index that names no element
export const updatePositionedElementText = (
  document: PositionedDocument,
  index: number,
  text: string,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element || getPositionedElementText(element) === undefined) return [];

  const pointer = getElementPointer(index);
  const property = element.type === PositionedElementType.Arrow ? "label" : "text";
  const operations: JsonPatchOperation[] = [
    { op: JsonPatchOperationType.Replace, path: `${pointer}/${property}`, value: text },
  ];
  return element.type === PositionedElementType.Text && !element.isWrapped
    ? [
        ...operations,
        {
          op: JsonPatchOperationType.Replace,
          path: `${pointer}/width`,
          value: getAutoTextWidth(text, element.textSize),
        },
      ]
    : operations;
};
