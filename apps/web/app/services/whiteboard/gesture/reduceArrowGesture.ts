import type { GestureArrow } from "@/models/whiteboard/GestureArrow";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { getArrowEnd } from "@/services/whiteboard/gesture/getArrowEnd";
import { getArrowOperations } from "@/services/whiteboard/gesture/getArrowOperations";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { reducePointerGesture } from "@/services/whiteboard/gesture/reducePointerGesture";
import { WHITEBOARD_DEFAULT_ARROWHEAD } from "@/services/whiteboard/palette/constants";

// An arrow previews from its start to the end the pointer is over, bound where that end lands. A release commits the arrow as one edit,
// But a release short of the drag start distance is a click, which draws no arrow
export const reduceArrowGesture = (
  state: WhiteboardGestureState,
  gesture: GestureArrow,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePointerGesture(state, event, (point) => {
    const isDragged = getPointDistance(gesture.screen, event.screen) >= DRAG_START_DISTANCE;
    const end = getArrowEnd(state, point, gesture.start.binding?.elementId);
    return isDragged
      ? getArrowOperations(state.document, gesture.elementId, gesture.start, {
          ...end,
          arrowhead: WHITEBOARD_DEFAULT_ARROWHEAD,
        })
      : [];
  });
