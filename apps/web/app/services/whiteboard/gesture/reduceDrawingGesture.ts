import type { GestureDrawing } from "@/models/whiteboard/GestureDrawing";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { STROKE_SAMPLE_DISTANCE } from "@/services/whiteboard/gesture/constants";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { getPreviewOrCommitResult } from "@/services/whiteboard/gesture/getPreviewOrCommitResult";
import { getStrokeOperations } from "@/services/whiteboard/gesture/getStrokeOperations";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { reducePreviewOrCommitGesture } from "@/services/whiteboard/gesture/reducePreviewOrCommitGesture";
import { takeOne } from "@esposter/shared";

// A stroke takes each point the pointer passes once it has moved a sample distance from the last one, and a release commits
// The stroke as one element, its last point the point released at
export const reduceDrawingGesture = (
  state: WhiteboardGestureState,
  gesture: GestureDrawing,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePreviewOrCommitGesture(state, event, (action) => {
    const point = getWorldPoint(event.screen, state.viewport);
    const lastPoint = takeOne(gesture.points, gesture.points.length - 1);
    const points =
      getPointDistance(lastPoint, point) >= STROKE_SAMPLE_DISTANCE ? [...gesture.points, point] : gesture.points;
    const operations = getStrokeOperations(state.document, gesture.elementId, points);
    return getPreviewOrCommitResult({ ...state, gesture: { ...gesture, points } }, operations, action);
  });
