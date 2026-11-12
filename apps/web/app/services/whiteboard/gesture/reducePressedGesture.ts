import type { GestureMarquee } from "@/models/whiteboard/GestureMarquee";
import type { GestureMoving } from "@/models/whiteboard/GestureMoving";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { GesturePressed } from "@/models/whiteboard/GesturePressed";
import type { GestureResizing } from "@/models/whiteboard/GestureResizing";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { checkIsDragStarted } from "@/services/whiteboard/gesture/checkIsDragStarted";
import { getClickSelection } from "@/services/whiteboard/gesture/getClickSelection";
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
    case GesturePointerAction.Down:
      return { operations: [], state };
    case GesturePointerAction.Move: {
      if (!checkIsDragStarted(gesture.screen, event.screen)) return { operations: [], state };

      if (gesture.handle !== undefined) {
        const resizing: GestureResizing = {
          handle: gesture.handle,
          origin: gesture.origin,
          phase: GesturePhase.Resizing,
          pointerId: gesture.pointerId,
        };
        return reduceResizingGesture({ ...state, gesture: resizing }, resizing, event);
      }
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

      // An Alt drag starts with its copies selected in place of the originals, which a cancel restores
      if (gesture.originalIdCopyIdMap) {
        const copying: GestureMoving = {
          guides: [],
          origin: gesture.origin,
          originalIdCopyIdMap: gesture.originalIdCopyIdMap,
          phase: GesturePhase.Moving,
          pointerId: gesture.pointerId,
        };
        return reduceMovingGesture(
          { ...state, gesture: copying, selectedIds: Object.values(gesture.originalIdCopyIdMap) },
          copying,
          event,
        );
      }

      const moving: GestureMoving = {
        guides: [],
        origin: gesture.origin,
        phase: GesturePhase.Moving,
        pointerId: gesture.pointerId,
      };
      return reduceMovingGesture({ ...state, gesture: moving }, moving, event);
    }
    case GesturePointerAction.Up:
      return {
        operations: [],
        state: { ...state, gesture: undefined, selectedIds: getClickSelection(state, gesture) },
      };
    default:
      return exhaustiveGuard(event.action);
  }
};
