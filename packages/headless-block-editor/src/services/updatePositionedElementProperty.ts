import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { PositionedElementProperty } from "#src/models/PositionedElementProperty";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { JsonPatchOperationType } from "@esposter/shared";

// Replaces one property of the element at an index: a fill, which a shape or a sticky note holds, or a route or an arrowhead, which an arrow holds
// No operations for a property the element does not hold, or for an index that names no element
export const updatePositionedElementProperty = (
  document: PositionedDocument,
  index: number,
  change: PositionedElementProperty,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element) return [];
  const isApplicable =
    change.property === "fill"
      ? element.type === PositionedElementType.Shape || element.type === PositionedElementType.StickyNote
      : element.type === PositionedElementType.Arrow;
  if (!isApplicable) return [];

  const propertyPath = change.property === "hasArrowhead" ? `${change.end}/hasArrowhead` : change.property;
  return [
    { op: JsonPatchOperationType.Replace, path: `${getElementPointer(index)}/${propertyPath}`, value: change.value },
  ];
};
