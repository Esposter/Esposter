import type { GesturePointerEvent } from "#src/models/whiteboard/GesturePointerEvent";
import type { GestureResizing } from "#src/models/whiteboard/GestureResizing";
import type { WhiteboardGestureResult } from "#src/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "#src/models/whiteboard/WhiteboardGestureState";

import { getResizeOperations } from "#src/services/whiteboard/gesture/getResizeOperations";
import { getScaleOperations } from "#src/services/whiteboard/gesture/getScaleOperations";
import { reducePointerGesture } from "#src/services/whiteboard/gesture/reducePointerGesture";
import { takeOne } from "@esposter/shared";

// A resize previews the selection stretched by the pointer's travel from the press: one element is stretched from its handle, and several are
// Scaled together about the side opposite the handle. A release commits that stretch as one edit
export const reduceResizingGesture = (
  state: WhiteboardGestureState,
  gesture: GestureResizing,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePointerGesture(state, event, (point) => {
    const delta = { x: point.x - gesture.origin.x, y: point.y - gesture.origin.y };
    return state.selectedIds.length === 1
      ? getResizeOperations(state.document, takeOne(state.selectedIds), gesture.handle, delta)
      : getScaleOperations(state.document, state.selectedIds, gesture.handle, delta);
  });
