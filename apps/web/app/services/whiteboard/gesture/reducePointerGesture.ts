import type { GesturePointerEvent } from "#src/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "#src/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "#src/models/whiteboard/WhiteboardGestureState";
import type { JsonPatchOperation } from "@esposter/shared";
import type { Point } from "vue-block-editor-headless";

import { getPreviewOrCommitResult } from "#src/services/whiteboard/gesture/getPreviewOrCommitResult";
import { getWorldPoint } from "#src/services/whiteboard/gesture/getWorldPoint";
import { reducePreviewOrCommitGesture } from "#src/services/whiteboard/gesture/reducePreviewOrCommitGesture";

// A move or a release is handed the operations the gesture makes of the pointer's document point, and previews or
// Commits them
export const reducePointerGesture = (
  state: WhiteboardGestureState,
  event: GesturePointerEvent,
  getOperations: (point: Point) => JsonPatchOperation[],
): WhiteboardGestureResult =>
  reducePreviewOrCommitGesture(state, event, (action) =>
    getPreviewOrCommitResult(state, getOperations(getWorldPoint(event.screen, state.viewport)), action),
  );
