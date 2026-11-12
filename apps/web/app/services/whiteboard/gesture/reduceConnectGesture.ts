import type { GestureConnecting } from "@/models/whiteboard/GestureConnecting";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { checkIsDragStarted } from "@/services/whiteboard/gesture/checkIsDragStarted";
import { getArrowEnd } from "@/services/whiteboard/gesture/getArrowEnd";
import { getConnectOperations } from "@/services/whiteboard/gesture/getConnectOperations";
import { getHitElementId } from "@/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "@/services/whiteboard/gesture/getHitTolerance";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { reducePointerGesture } from "@/services/whiteboard/gesture/reducePointerGesture";
import { PositionedElementType } from "vue-block-editor-headless";

// A drag from a connection handle previews the arrow it would draw, and a release commits it as one edit. A release on another shape joins that shape
// Alone, and a release on empty canvas adds a shape of the source's kind there, joined by the arrow. A press released before it has travelled the drag
// Start distance is a click, which adds nothing
export const reduceConnectGesture = (
  state: WhiteboardGestureState,
  gesture: GestureConnecting,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePointerGesture(state, event, () => {
    const isDragged = checkIsDragStarted(gesture.screen, event.screen);
    if (!isDragged) return [];

    const source = state.document.elements.find(({ id }) => id === gesture.elementId);
    if (source?.type !== PositionedElementType.Shape) return [];

    const release = getWorldPoint(event.screen, state.viewport);
    // The release joins the shape it lands on by the rule drawing uses, so the source itself and an empty canvas both leave it unbound
    const target = getArrowEnd(state, release, gesture.elementId).binding;
    // A release on an element it cannot join, the source itself or one that takes no connection, adds nothing, since a new shape there would stack on it
    if (
      target === undefined &&
      getHitElementId(state.document, release, getHitTolerance(state.viewport.scale)) !== undefined
    )
      return [];

    return getConnectOperations(state.document, source, gesture.connectionIndex, {
      arrowId: gesture.arrowId,
      release,
      shapeId: gesture.shapeId,
      target,
    });
  });
