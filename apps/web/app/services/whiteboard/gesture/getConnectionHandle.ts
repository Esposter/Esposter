import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getConnectionHandlePoint } from "@/services/whiteboard/gesture/getConnectionHandlePoint";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { takeOne } from "@esposter/shared";
import { CONNECTION_POINT_COUNT, getBindableShape, PositionedElementType } from "vue-block-editor-headless";

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
  if (selectedIds.length !== 1) return undefined;

  const elementId = takeOne(selectedIds);
  const index = getElementIndexById(document, elementId);
  if (index === undefined) return undefined;

  const element = takeOne(document.elements, index);
  if (element.type !== PositionedElementType.Shape) return undefined;

  const connectionIndexes = Array.from({ length: CONNECTION_POINT_COUNT }, (_, connectionIndex) => connectionIndex);
  const connectionIndex = connectionIndexes.find(
    (candidate) =>
      getBindableShape(document.elements, { connectionPointIndex: candidate, elementId }) !== undefined &&
      getPointDistance(point, getConnectionHandlePoint(element, candidate, scale)) <= tolerance,
  );
  return connectionIndex === undefined ? undefined : { connectionIndex, elementId };
};
