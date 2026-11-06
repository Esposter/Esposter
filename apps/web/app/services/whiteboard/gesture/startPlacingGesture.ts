import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";

import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { getSnappedPoint } from "@/services/whiteboard/gesture/getSnappedPoint";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";

// A press with a placing tool holds the element it would place: its id is fixed at the press, and its origin is the press's document point
// On the grid when snapping
export const startPlacingGesture = (
  state: WhiteboardGestureState,
  event: GesturePointerEvent,
  placement: WhiteboardPlacement,
): WhiteboardGestureResult => {
  const worldPoint = getWorldPoint(event.screen, state.viewport);
  const origin = getSnappedPoint(worldPoint, state.isSnapEnabled);
  return {
    operations: [],
    state: {
      ...state,
      gesture: {
        elementId: state.createId(),
        origin,
        phase: GesturePhase.Placing,
        placement,
        pointerId: event.pointerId,
        screen: event.screen,
      },
    },
  };
};
