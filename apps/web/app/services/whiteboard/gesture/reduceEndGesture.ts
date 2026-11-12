import type { GestureEnd } from "@/models/whiteboard/GestureEnd";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { getArrowEnd } from "@/services/whiteboard/gesture/getArrowEnd";
import { getEndOperations } from "@/services/whiteboard/gesture/getEndOperations";
import { reducePointerGesture } from "@/services/whiteboard/gesture/reducePointerGesture";

// A drag of a free arrow end previews the end moved to the pointer, and a release commits it as one edit. Released on a shape, the end binds to the
// Connection point that release lands nearest, as drawing does, and released on empty canvas it stays free where it was released. The arrow being dragged
// Is left out of the hit, since its own line runs under the pointer where the end is released
export const reduceEndGesture = (
  state: WhiteboardGestureState,
  gesture: GestureEnd,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePointerGesture(state, event, (point) => {
    const withoutArrow = {
      ...state,
      document: { elements: state.document.elements.filter(({ id }) => id !== gesture.arrowId) },
    };
    const end = getArrowEnd(withoutArrow, point);
    return getEndOperations(state.document, gesture.arrowId, gesture.endKey, end);
  });
