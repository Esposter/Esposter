import type { GesturePanning } from "@/models/whiteboard/GesturePanning";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { exhaustiveGuard } from "@esposter/shared";

// A pan moves the viewport's origin against the pointer's travel, in document units at the viewport's scale, so the document point
// Under the press stays under the pointer. A pan never changes the document, so a release commits nothing
export const reducePanningGesture = (
  state: WhiteboardGestureState,
  gesture: GesturePanning,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  switch (event.action) {
    case GesturePointerAction.Cancel:
    case GesturePointerAction.Up:
      return { operations: [], state: { ...state, gesture: undefined } };
    case GesturePointerAction.Down:
      return { operations: [], state };
    case GesturePointerAction.Move: {
      const { scale } = state.viewport;
      return {
        operations: [],
        state: {
          ...state,
          viewport: {
            scale,
            x: gesture.viewportOrigin.x - (event.screen.x - gesture.screen.x) / scale,
            y: gesture.viewportOrigin.y - (event.screen.y - gesture.screen.y) / scale,
          },
        },
      };
    }
    default:
      return exhaustiveGuard(event.action);
  }
};
