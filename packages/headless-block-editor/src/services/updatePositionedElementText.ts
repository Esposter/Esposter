import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { getPositionedElementText } from "#src/services/getPositionedElementText";
import { JsonPatchOperationType } from "@esposter/shared";

// Replaces the text of the element at an index: the text of a shape, a text box or a sticky note, or the label of an arrow
// No operations for an image or a stroke, which hold no text, or for an index that names no element
export const updatePositionedElementText = (
  document: PositionedDocument,
  index: number,
  text: string,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element || getPositionedElementText(element) === undefined) return [];

  const property = element.type === PositionedElementType.Arrow ? "label" : "text";
  return [{ op: JsonPatchOperationType.Replace, path: `${getElementPointer(index)}/${property}`, value: text }];
};
