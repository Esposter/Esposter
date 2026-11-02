import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { GestureDrawing } from "@/models/whiteboard/GestureDrawing";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { STROKE_SAMPLE_DISTANCE } from "@/services/whiteboard/gesture/constants";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { getStrokeOperations } from "@/services/whiteboard/gesture/getStrokeOperations";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { applyPatches, exhaustiveGuard, takeOne } from "@esposter/shared";

// A stroke takes each point the pointer passes once it has moved a sample distance from the last one, and a release commits
// The stroke as one element, its last point the point released at
export const reduceDrawingGesture = (
  state: WhiteboardGestureState,
  gesture: GestureDrawing,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  switch (event.action) {
    case GesturePointerAction.Cancel:
      return { operations: [], state: { ...state, gesture: undefined, preview: undefined } };
    case GesturePointerAction.Move:
    case GesturePointerAction.Up: {
      const point = getWorldPoint(event.screen, state.viewport);
      const lastPoint = takeOne(gesture.points, gesture.points.length - 1);
      const points =
        getPointDistance(lastPoint, point) >= STROKE_SAMPLE_DISTANCE ? [...gesture.points, point] : gesture.points;
      const operations = getStrokeOperations(state.document, gesture.elementId, points);
      if (event.action === GesturePointerAction.Move)
        return {
          operations: [],
          state: {
            ...state,
            gesture: { ...gesture, points },
            preview: applyPatches(state.document, operations).document,
          },
        };

      return {
        operations,
        state: {
          ...state,
          document: applyPatches(state.document, operations).document,
          gesture: undefined,
          preview: undefined,
        },
      };
    }
    case GesturePointerAction.Down:
      return { operations: [], state };
    default:
      return exhaustiveGuard(event.action);
  }
};
