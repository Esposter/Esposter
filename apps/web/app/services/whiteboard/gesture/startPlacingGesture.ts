import type { GesturePointerEvent } from "#src/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "#src/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "#src/models/whiteboard/WhiteboardGestureState";
import type { WhiteboardPlacement } from "#src/models/whiteboard/WhiteboardPlacement";

import { GesturePhase } from "#src/models/whiteboard/GesturePhase";
import { getWorldPoint } from "#src/services/whiteboard/gesture/getWorldPoint";

// A press with a placing tool holds the element it would place: its id is fixed at the press, and its origin is the press's document point
export const startPlacingGesture = (
  state: WhiteboardGestureState,
  event: GesturePointerEvent,
  placement: WhiteboardPlacement,
): WhiteboardGestureResult => {
  const origin = getWorldPoint(event.screen, state.viewport);
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
