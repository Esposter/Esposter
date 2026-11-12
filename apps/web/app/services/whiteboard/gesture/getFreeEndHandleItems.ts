import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { takeOne } from "@esposter/shared";
import { ArrowEndKey, PositionedElementType } from "vue-block-editor-headless";

// Each free end handle the one selected arrow shows, with the end it moves and the point the handle is drawn at. A bound end shows none, since its
// Point is the connection point its binding names
export const getFreeEndHandleItems = (
  document: PositionedDocument,
  selectedIds: string[],
): { endKey: ArrowEndKey; point: Point }[] => {
  if (selectedIds.length !== 1) return [];

  const index = getElementIndexById(document, takeOne(selectedIds));
  if (index === undefined) return [];

  const element = takeOne(document.elements, index);
  if (element.type !== PositionedElementType.Arrow) return [];

  return [ArrowEndKey.Start, ArrowEndKey.End]
    .filter((endKey) => element[endKey].binding === undefined)
    .map((endKey) => ({ endKey, point: element[endKey].point }));
};
