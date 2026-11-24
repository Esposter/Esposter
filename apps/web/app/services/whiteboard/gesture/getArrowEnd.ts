import type { WhiteboardGestureState } from "#src/models/whiteboard/WhiteboardGestureState";
import type { Except } from "type-fest";
import type { ArrowEnd, Point } from "vue-block-editor-headless";

import { getHitElementId } from "#src/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "#src/services/whiteboard/gesture/getHitTolerance";
import { getNearestConnectionPointIndex } from "#src/services/whiteboard/gesture/getNearestConnectionPointIndex";
import { getBindableShape, getConnectionPoint, getElementBounds } from "vue-block-editor-headless";

// The end an arrow takes where a point lands: bound to the connection point nearest the point on the shape the point
// Hits, or free at the point. an annotation takes no connection, and the shape an arrow starts from is left free by its
// Own end, so either leaves the end free. The end holds no arrowhead, since the caller gives each end its own
export const getArrowEnd = (
  state: WhiteboardGestureState,
  point: Point,
  excludedElementId?: string,
): Except<ArrowEnd, "arrowhead"> => {
  const elementId = getHitElementId(state.document, point, getHitTolerance(state.viewport.scale));
  const element = state.document.elements.find(({ id }) => id === elementId);
  if (element === undefined || element.id === excludedElementId) return { point };

  const bounds = getElementBounds(element);
  const connectionPointIndex = getNearestConnectionPointIndex(bounds, point);
  const binding = { connectionPointIndex, elementId: element.id };
  if (getBindableShape(state.document.elements, binding) === undefined) return { point };

  return { binding, point: getConnectionPoint(bounds, connectionPointIndex) };
};
