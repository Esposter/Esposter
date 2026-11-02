import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { checkIsBoundOnlyTo } from "#src/services/checkIsBoundOnlyTo";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { JsonPatchOperationType } from "@esposter/shared";

// Deletes the element at an index. A shape also takes the arrows bound only to it, and unbinds the end of each arrow bound to it
// That is bound elsewhere too. The unbinds come first, then the removals from the last index down, so no later index has shifted
export const deletePositionedElement = (document: PositionedDocument, index: number): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element) return [];
  if (element.type !== PositionedElementType.Shape)
    return [{ op: JsonPatchOperationType.Remove, path: getElementPointer(index) }];

  const unbindOperations: JsonPatchOperation[] = [];
  const removedIndexes = [index];
  for (const [arrowIndex, arrow] of document.elements.entries()) {
    if (arrow.type !== PositionedElementType.Arrow) continue;
    if (checkIsBoundOnlyTo(arrow, element.id)) {
      removedIndexes.push(arrowIndex);
      continue;
    }
    for (const endKey of [ArrowEndKey.Start, ArrowEndKey.End])
      if (arrow[endKey].binding?.elementId === element.id)
        unbindOperations.push({
          op: JsonPatchOperationType.Remove,
          path: `${getElementPointer(arrowIndex)}/${endKey}/binding`,
        });
  }

  const removeOperations: JsonPatchOperation[] = removedIndexes
    .toSorted((firstIndex, secondIndex) => secondIndex - firstIndex)
    .map((removedIndex) => ({ op: JsonPatchOperationType.Remove, path: getElementPointer(removedIndex) }));
  return [...unbindOperations, ...removeOperations];
};
