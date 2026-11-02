import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { GestureMoving } from "@/models/whiteboard/GestureMoving";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import { reducePointerGesture } from "@/services/whiteboard/gesture/reducePointerGesture";

// A move previews the selection shifted by the pointer's travel from the press. A release commits that shift as one edit
export const reduceMovingGesture = (
  state: WhiteboardGestureState,
  gesture: GestureMoving,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePointerGesture(state, event, (point) =>
    getMoveOperations(
      state.document,
      state.selectedIds,
      { x: point.x - gesture.origin.x, y: point.y - gesture.origin.y },
      state.isSnapEnabled,
    ),
  );
