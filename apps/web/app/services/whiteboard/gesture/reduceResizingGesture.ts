import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { GestureResizing } from "@/models/whiteboard/GestureResizing";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { getResizeOperations } from "@/services/whiteboard/gesture/getResizeOperations";
import { reducePointerGesture } from "@/services/whiteboard/gesture/reducePointerGesture";

// A resize previews the element stretched by the pointer's travel from the press. A release commits that stretch as one edit
export const reduceResizingGesture = (
  state: WhiteboardGestureState,
  gesture: GestureResizing,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePointerGesture(state, event, (point) =>
    getResizeOperations(state.document, gesture.elementId, gesture.handle, {
      x: point.x - gesture.origin.x,
      y: point.y - gesture.origin.y,
    }),
  );
