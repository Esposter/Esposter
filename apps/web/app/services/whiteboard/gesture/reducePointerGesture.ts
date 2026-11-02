import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type { JsonPatchOperation } from "@esposter/shared";
import type { Point } from "headless-block-editor";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { getPreviewOrCommitResult } from "@/services/whiteboard/gesture/getPreviewOrCommitResult";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { exhaustiveGuard } from "@esposter/shared";

// A cancel drops the gesture and a press holds the state, for every gesture alike. A move or a release is handed the operations the gesture
// Makes of the pointer's document point, and previews or commits them
export const reducePointerGesture = (
  state: WhiteboardGestureState,
  event: GesturePointerEvent,
  getOperations: (point: Point) => JsonPatchOperation[],
): WhiteboardGestureResult => {
  switch (event.action) {
    case GesturePointerAction.Cancel:
      return { operations: [], state: { ...state, gesture: undefined, preview: undefined } };
    case GesturePointerAction.Down:
      return { operations: [], state };
    case GesturePointerAction.Move:
    case GesturePointerAction.Up:
      return getPreviewOrCommitResult(state, getOperations(getWorldPoint(event.screen, state.viewport)), event.action);
    default:
      return exhaustiveGuard(event.action);
  }
};
