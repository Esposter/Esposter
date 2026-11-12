import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { takeOne } from "@esposter/shared";
import { ArrowEndKey, PositionedElementType } from "vue-block-editor-headless";

// The free end of the one selected arrow a point lands on: the arrow and which of its ends, or undefined when the point lands on none. A bound end
// Shows no handle, since its point is the connection point its binding names, and a free end's point is the one the handle moves
export interface FreeEndHandle {
  arrowId: string;
  endKey: ArrowEndKey;
}

export const getFreeEndHandle = (
  document: PositionedDocument,
  selectedIds: string[],
  point: Point,
  tolerance: number,
): FreeEndHandle | undefined => {
  if (selectedIds.length !== 1) return undefined;

  const arrowId = takeOne(selectedIds);
  const index = getElementIndexById(document, arrowId);
  if (index === undefined) return undefined;

  const element = takeOne(document.elements, index);
  if (element.type !== PositionedElementType.Arrow) return undefined;

  const endKey = [ArrowEndKey.Start, ArrowEndKey.End].find(
    (candidate) =>
      element[candidate].binding === undefined && getPointDistance(point, element[candidate].point) <= tolerance,
  );
  return endKey === undefined ? undefined : { arrowId, endKey };
};
