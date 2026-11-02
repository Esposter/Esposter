import type { ArrowBinding } from "#src/models/ArrowBinding";
import type { ArrowEndKey } from "#src/models/ArrowEndKey";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { getBindableShape } from "#src/services/getBindableShape";
import { getConnectionPoint } from "#src/services/getConnectionPoint";
import { getElementBounds } from "#src/services/getElementBounds";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { JsonPatchOperationType } from "@esposter/shared";

// Binds an arrow end to a connection point of a shape and moves the end onto that point, or no operations when the arrow or the shape cannot take the binding
export const bindPositionedArrowEnd = (
  document: PositionedDocument,
  index: number,
  arrowEndKey: ArrowEndKey,
  binding: ArrowBinding,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  const shape = getBindableShape(document.elements, binding);
  if (element?.type !== PositionedElementType.Arrow || !shape) return [];

  const endPointer = `${getElementPointer(index)}/${arrowEndKey}`;
  return [
    { op: JsonPatchOperationType.Add, path: `${endPointer}/binding`, value: binding },
    {
      op: JsonPatchOperationType.Replace,
      path: `${endPointer}/point`,
      value: getConnectionPoint(getElementBounds(shape), binding.connectionPointIndex),
    },
  ];
};
