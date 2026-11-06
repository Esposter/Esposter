import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { takeOne } from "@esposter/shared";
import { getElementBounds, GRID_SIZE, movePositionedElement, snapToGrid } from "vue-block-editor-headless";

// The operations that move each element of a selection by a delta in document units. With snap on, the delta is changed so the selection's
// Top-left corner lands on the grid, and the selection keeps its layout. Each arrow bound to a moved shape is rerouted in the same edit
export const getMoveOperations = (
  document: PositionedDocument,
  elementIds: string[],
  delta: Point,
  isSnapEnabled: boolean,
): JsonPatchOperation[] => {
  const movedBounds = elementIds.flatMap((elementId) => {
    const index = getElementIndexById(document, elementId);
    if (index === undefined) return [];

    return [{ bounds: getElementBounds(takeOne(document.elements, index)), index }];
  });
  const left = Math.min(...movedBounds.map(({ bounds }) => bounds.x));
  const top = Math.min(...movedBounds.map(({ bounds }) => bounds.y));
  const shift = {
    x: isSnapEnabled ? snapToGrid(left + delta.x, GRID_SIZE) - left : delta.x,
    y: isSnapEnabled ? snapToGrid(top + delta.y, GRID_SIZE) - top : delta.y,
  };
  return movedBounds.flatMap(({ bounds: { x, y }, index }) =>
    movePositionedElement(document, index, { x: x + shift.x, y: y + shift.y }),
  );
};
