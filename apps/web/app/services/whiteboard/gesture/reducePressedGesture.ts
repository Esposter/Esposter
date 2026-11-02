import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { GestureMarquee } from "@/models/whiteboard/GestureMarquee";
import type { GestureMoving } from "@/models/whiteboard/GestureMoving";
import type { GesturePressed } from "@/models/whiteboard/GesturePressed";
import type { GestureResizing } from "@/models/whiteboard/GestureResizing";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { getClickSelection } from "@/services/whiteboard/gesture/getClickSelection";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { reduceMarqueeGesture } from "@/services/whiteboard/gesture/reduceMarqueeGesture";
import { reduceMovingGesture } from "@/services/whiteboard/gesture/reduceMovingGesture";
import { reduceResizingGesture } from "@/services/whiteboard/gesture/reduceResizingGesture";
import { exhaustiveGuard } from "@esposter/shared";

// A press released before it has travelled the drag start distance is a click. Past that distance the press becomes a marquee
// On the canvas, a resize from a handle, or a move of the selection, and the event that starts it is read by the new phase
export const reducePressedGesture = (
  state: WhiteboardGestureState,
  gesture: GesturePressed,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  switch (event.action) {
    case GesturePointerAction.Cancel:
      return { operations: [], state: { ...state, gesture: undefined } };
    case GesturePointerAction.Move: {
      if (getPointDistance(gesture.screen, event.screen) < DRAG_START_DISTANCE) return { operations: [], state };

      if (!gesture.elementId) {
        const marquee: GestureMarquee = {
          baseIds: gesture.isAdditive ? state.selectedIds : [],
          current: gesture.origin,
          origin: gesture.origin,
          phase: GesturePhase.Marquee,
          pointerId: gesture.pointerId,
        };
        return reduceMarqueeGesture({ ...state, gesture: marquee }, marquee, event);
      }
      if (gesture.handle !== undefined) {
        const resizing: GestureResizing = {
          elementId: gesture.elementId,
          handle: gesture.handle,
          origin: gesture.origin,
          phase: GesturePhase.Resizing,
          pointerId: gesture.pointerId,
        };
        return reduceResizingGesture({ ...state, gesture: resizing }, resizing, event);
      }

      const moving: GestureMoving = {
        origin: gesture.origin,
        phase: GesturePhase.Moving,
        pointerId: gesture.pointerId,
      };
      return reduceMovingGesture({ ...state, gesture: moving }, moving, event);
    }
    case GesturePointerAction.Down:
      return { operations: [], state };
    case GesturePointerAction.Up:
      return {
        operations: [],
        state: { ...state, gesture: undefined, selectedIds: getClickSelection(state, gesture) },
      };
    default:
      return exhaustiveGuard(event.action);
  }
};
