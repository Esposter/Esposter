import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { takeOne } from "@esposter/shared";
import { getElementBounds, movePositionedElement } from "vue-block-editor-headless";

// The operations that move each element of a selection by a delta in document units. Each arrow bound to a moved shape is rerouted in the same edit
export const getMoveOperations = (
  document: PositionedDocument,
  elementIds: string[],
  delta: Point,
): JsonPatchOperation[] => {
  const movedBounds = elementIds.flatMap((elementId) => {
    const index = getElementIndexById(document, elementId);
    if (index === undefined) return [];

    return [{ bounds: getElementBounds(takeOne(document.elements, index)), index }];
  });
  return movedBounds.flatMap(({ bounds: { x, y }, index }) =>
    movePositionedElement(document, index, { x: x + delta.x, y: y + delta.y }),
  );
};
