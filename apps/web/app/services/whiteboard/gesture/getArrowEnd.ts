import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type { ArrowEnd, Point } from "headless-block-editor";

import { getHitElementId } from "@/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "@/services/whiteboard/gesture/getHitTolerance";
import { getNearestConnectionPointIndex } from "@/services/whiteboard/gesture/getNearestConnectionPointIndex";
import { getBindableShape, getConnectionPoint, getElementBounds } from "headless-block-editor";

// The end an arrow takes where a point lands: bound to the connection point nearest the point on the shape the point hits, or free at the point.
// An annotation takes no connection, and the shape an arrow starts from is left free by its own end, so either leaves the end free
export const getArrowEnd = (
  state: WhiteboardGestureState,
  point: Point,
  hasArrowhead: boolean,
  excludedElementId?: string,
): ArrowEnd => {
  const elementId = getHitElementId(state.document, point, getHitTolerance(state.viewport.scale));
  const element = state.document.elements.find(({ id }) => id === elementId);
  if (element === undefined || element.id === excludedElementId) return { hasArrowhead, point };

  const bounds = getElementBounds(element);
  const connectionPointIndex = getNearestConnectionPointIndex(bounds, point);
  const binding = { connectionPointIndex, elementId: element.id };
  if (getBindableShape(state.document.elements, binding) === undefined) return { hasArrowhead, point };

  return { binding, hasArrowhead, point: getConnectionPoint(bounds, connectionPointIndex) };
};
