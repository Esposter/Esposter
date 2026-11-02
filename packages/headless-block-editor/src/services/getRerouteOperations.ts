import type { PositionedElement } from "#src/models/PositionedElement";
import type { ShapeElement } from "#src/models/ShapeElement";
import type { JsonPatchOperation } from "@esposter/shared";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { getConnectionPoint } from "#src/services/getConnectionPoint";
import { getElementBounds } from "#src/services/getElementBounds";
import { getElementPointer } from "#src/services/getElementPointer";
import { JsonPatchOperationType } from "@esposter/shared";

// The replacements that move each arrow end bound to a shape onto that shape's connection point, read from the shape's bounds as given
export const getRerouteOperations = (elements: PositionedElement[], shape: ShapeElement): JsonPatchOperation[] => {
  const bounds = getElementBounds(shape);
  const operations: JsonPatchOperation[] = [];
  for (const [index, element] of elements.entries()) {
    if (element.type !== PositionedElementType.Arrow) continue;
    for (const endKey of [ArrowEndKey.Start, ArrowEndKey.End]) {
      const binding = element[endKey].binding;
      if (binding?.elementId === shape.id)
        operations.push({
          op: JsonPatchOperationType.Replace,
          path: `${getElementPointer(index)}/${endKey}/point`,
          value: getConnectionPoint(bounds, binding.connectionPointIndex),
        });
    }
  }
  return operations;
};
