import type { GesturePointerEvent } from "#src/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "#src/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "#src/models/whiteboard/WhiteboardGestureState";

import { GesturePointerAction } from "#src/models/whiteboard/GesturePointerAction";
import { exhaustiveGuard } from "@esposter/shared";

// A cancel drops the gesture and its preview, and a press holds the state, for every gesture that previews what it
// Would do. A move or a release is handed to the gesture, which previews or commits its operations
export const reducePreviewOrCommitGesture = (
  state: WhiteboardGestureState,
  event: GesturePointerEvent,
  reduceMoveOrRelease: (
    action: typeof GesturePointerAction.Move | typeof GesturePointerAction.Up,
  ) => WhiteboardGestureResult,
): WhiteboardGestureResult => {
  switch (event.action) {
    case GesturePointerAction.Cancel:
      return { operations: [], state: { ...state, gesture: undefined, preview: undefined } };
    case GesturePointerAction.Down:
      return { operations: [], state };
    case GesturePointerAction.Move:
    case GesturePointerAction.Up:
      return reduceMoveOrRelease(event.action);
    default:
      return exhaustiveGuard(event.action);
  }
};
