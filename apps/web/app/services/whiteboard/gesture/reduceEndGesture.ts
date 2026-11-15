import type { GestureEnd } from "#src/models/whiteboard/GestureEnd";
import type { GesturePointerEvent } from "#src/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "#src/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "#src/models/whiteboard/WhiteboardGestureState";

import { checkIsDragStarted } from "#src/services/whiteboard/gesture/checkIsDragStarted";
import { getArrowEnd } from "#src/services/whiteboard/gesture/getArrowEnd";
import { getEndOperations } from "#src/services/whiteboard/gesture/getEndOperations";
import { reducePointerGesture } from "#src/services/whiteboard/gesture/reducePointerGesture";

// A drag of a free arrow end previews the end moved to the pointer, and a release commits it as one edit. Released on a shape, the end binds to the
// Connection point that release lands nearest, as drawing does, and released on empty canvas it stays free where it was released. The arrow being dragged
// Is left out of the hit, since its own line runs under the pointer where the end is released. A press released before it has travelled the drag start
// Distance is a click, which moves and binds nothing and leaves no undo step
export const reduceEndGesture = (
  state: WhiteboardGestureState,
  gesture: GestureEnd,
  event: GesturePointerEvent,
): WhiteboardGestureResult =>
  reducePointerGesture(state, event, (point) => {
    if (!checkIsDragStarted(gesture.screen, event.screen)) return [];

    const withoutArrow = {
      ...state,
      document: { elements: state.document.elements.filter(({ id }) => id !== gesture.arrowId) },
    };
    const end = getArrowEnd(withoutArrow, point);
    return getEndOperations(state.document, gesture.arrowId, gesture.endKey, end);
  });
