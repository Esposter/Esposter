import type { Point } from "#src/models/Point";
import type { PositionedDocument } from "#src/models/PositionedDocument";

import { checkIsPointOnElement } from "#src/services/checkIsPointOnElement";

// The index of the topmost element a point hits, the last one in z-order, or undefined when it hits none
export const getHitElementIndex = (
  document: PositionedDocument,
  point: Point,
  tolerance: number,
): number | undefined => {
  const index = document.elements.findLastIndex((element) => checkIsPointOnElement(element, point, tolerance));
  return index === -1 ? undefined : index;
};
