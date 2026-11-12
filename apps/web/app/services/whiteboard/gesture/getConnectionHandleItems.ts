import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getConnectionHandlePoint } from "@/services/whiteboard/gesture/getConnectionHandlePoint";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { takeOne } from "@esposter/shared";
import { CONNECTION_POINT_COUNT, getBindableShape, PositionedElementType } from "vue-block-editor-headless";

// Each connection handle a single selected shape shows, with the index of its connection point and the point it is drawn at. None for a selection of
// several, for an element that is not a shape, or for an annotation, which takes no connection
export const getConnectionHandleItems = (
  document: PositionedDocument,
  selectedIds: string[],
  scale: number,
): { connectionIndex: number; point: Point }[] => {
  if (selectedIds.length !== 1) return [];

  const elementId = takeOne(selectedIds);
  const index = getElementIndexById(document, elementId);
  if (index === undefined) return [];

  const element = takeOne(document.elements, index);
  if (element.type !== PositionedElementType.Shape) return [];

  return Array.from({ length: CONNECTION_POINT_COUNT }, (_value, connectionIndex) => connectionIndex)
    .filter(
      (connectionIndex) =>
        getBindableShape(document.elements, { connectionPointIndex: connectionIndex, elementId }) !== undefined,
    )
    .map((connectionIndex) => ({ connectionIndex, point: getConnectionHandlePoint(element, connectionIndex, scale) }));
};
