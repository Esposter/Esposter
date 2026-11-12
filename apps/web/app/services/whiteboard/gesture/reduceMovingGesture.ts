import type { GestureMoving } from "@/models/whiteboard/GestureMoving";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { getCopyMoveOperations } from "@/services/whiteboard/gesture/getCopyMoveOperations";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import { reducePointerGesture } from "@/services/whiteboard/gesture/reducePointerGesture";

// A move previews the selection shifted by the pointer's travel from the press, or the copies of it an Alt drag makes. A release commits that shift
// As one edit. A cancel of an Alt drag restores the originals as the selection, since its copies are never made
export const reduceMovingGesture = (
  state: WhiteboardGestureState,
  gesture: GestureMoving,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  if (event.action === GesturePointerAction.Cancel && gesture.originalIdCopyIdMap)
    return {
      operations: [],
      state: {
        ...state,
        gesture: undefined,
        preview: undefined,
        selectedIds: Object.keys(gesture.originalIdCopyIdMap),
      },
    };

  return reducePointerGesture(state, event, (point) => {
    const delta = { x: point.x - gesture.origin.x, y: point.y - gesture.origin.y };
    return gesture.originalIdCopyIdMap
      ? getCopyMoveOperations(state.document, gesture.originalIdCopyIdMap, delta)
      : getMoveOperations(state.document, state.selectedIds, delta);
  });
};
