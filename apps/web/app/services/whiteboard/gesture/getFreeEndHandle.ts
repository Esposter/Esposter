import type { ArrowEndKey, Point, PositionedDocument } from "vue-block-editor-headless";

import { getFreeEndHandleItems } from "@/services/whiteboard/gesture/getFreeEndHandleItems";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { takeOne } from "@esposter/shared";

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
  const item = getFreeEndHandleItems(document, selectedIds).find(
    ({ point: handlePoint }) => getPointDistance(point, handlePoint) <= tolerance,
  );
  return item === undefined ? undefined : { arrowId: takeOne(selectedIds), endKey: item.endKey };
};
