import type { JsonPatchOperation } from "@esposter/shared";
import type { Except } from "type-fest";
import type { ArrowEnd, ArrowEndKey, PositionedDocument } from "vue-block-editor-headless";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { JsonPatchOperationType, takeOne } from "@esposter/shared";
import { bindPositionedArrowEnd, getElementPointer, PositionedElementType } from "vue-block-editor-headless";

// The operations that move a free arrow end to where the pointer releases it, and bind it when that release lands on a shape. An end released on empty
// Canvas is moved and left free, so the move and any binding are one list
export const getEndOperations = (
  document: PositionedDocument,
  arrowId: string,
  arrowEndKey: ArrowEndKey,
  end: Except<ArrowEnd, "arrowhead">,
): JsonPatchOperation[] => {
  const index = getElementIndexById(document, arrowId);
  if (index === undefined) return [];

  const element = takeOne(document.elements, index);
  if (element.type !== PositionedElementType.Arrow) return [];

  const pointer = `${getElementPointer(index)}/${arrowEndKey}/point`;
  const moveOperation: JsonPatchOperation = { op: JsonPatchOperationType.Replace, path: pointer, value: end.point };
  if (end.binding === undefined) return [moveOperation];

  return [moveOperation, ...bindPositionedArrowEnd(document, index, arrowEndKey, end.binding)];
};
