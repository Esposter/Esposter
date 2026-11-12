import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getConnectionHandleItems } from "@/services/whiteboard/gesture/getConnectionHandleItems";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { takeOne } from "@esposter/shared";

// A connection handle a press lands on: the selected shape it belongs to, and the connection point it sits at
export interface ConnectionHandle {
  connectionIndex: number;
  elementId: string;
}

// The connection handle of the one selected shape a point lands on, or undefined when it lands on none. Only a single selected shape shows them, and
// An annotation takes no connection, so it shows none. The tolerance is in document units, and the scale is the zoom the handles are drawn at
export const getConnectionHandle = (
  document: PositionedDocument,
  selectedIds: string[],
  point: Point,
  tolerance: number,
  scale: number,
): ConnectionHandle | undefined => {
  const item = getConnectionHandleItems(document, selectedIds, scale).find(
    ({ point: handlePoint }) => getPointDistance(point, handlePoint) <= tolerance,
  );
  return item === undefined ? undefined : { connectionIndex: item.connectionIndex, elementId: takeOne(selectedIds) };
};
