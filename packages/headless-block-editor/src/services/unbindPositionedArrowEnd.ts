import type { ArrowEndKey } from "#src/models/ArrowEndKey";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { JsonPatchOperationType } from "@esposter/shared";

// Removes an arrow end's binding and leaves the end at its point, or no operations when the end is not bound
export const unbindPositionedArrowEnd = (
  document: PositionedDocument,
  index: number,
  arrowEndKey: ArrowEndKey,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (element?.type !== PositionedElementType.Arrow || element[arrowEndKey].binding === undefined) return [];
  return [{ op: JsonPatchOperationType.Remove, path: `${getElementPointer(index)}/${arrowEndKey}/binding` }];
};
