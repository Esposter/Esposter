import type { GesturePointerEvent } from "#src/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "#src/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "#src/models/whiteboard/WhiteboardGestureState";

import { GesturePhase } from "#src/models/whiteboard/GesturePhase";
import { reduceArrowGesture } from "#src/services/whiteboard/gesture/reduceArrowGesture";
import { reduceConnectGesture } from "#src/services/whiteboard/gesture/reduceConnectGesture";
import { reduceDrawingGesture } from "#src/services/whiteboard/gesture/reduceDrawingGesture";
import { reduceEndGesture } from "#src/services/whiteboard/gesture/reduceEndGesture";
import { reduceMarqueeGesture } from "#src/services/whiteboard/gesture/reduceMarqueeGesture";
import { reduceMovingGesture } from "#src/services/whiteboard/gesture/reduceMovingGesture";
import { reducePanningGesture } from "#src/services/whiteboard/gesture/reducePanningGesture";
import { reducePlacingGesture } from "#src/services/whiteboard/gesture/reducePlacingGesture";
import { reducePressedGesture } from "#src/services/whiteboard/gesture/reducePressedGesture";
import { reduceResizingGesture } from "#src/services/whiteboard/gesture/reduceResizingGesture";
import { startWhiteboardGesture } from "#src/services/whiteboard/gesture/startWhiteboardGesture";
import { exhaustiveGuard } from "@esposter/shared";

// The one reducer every pointer event of a whiteboard goes through. With no gesture in progress a press starts one, and any other
// Event changes nothing. With one, the event goes to the phase the gesture is in, and an event from another pointer changes nothing
export const reduceWhiteboardGesture = (
  state: WhiteboardGestureState,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  const { gesture } = state;
  if (!gesture) return startWhiteboardGesture(state, event);
  if (event.pointerId !== gesture.pointerId) return { operations: [], state };

  switch (gesture.phase) {
    case GesturePhase.Arrow:
      return reduceArrowGesture(state, gesture, event);
    case GesturePhase.Connecting:
      return reduceConnectGesture(state, gesture, event);
    case GesturePhase.Drawing:
      return reduceDrawingGesture(state, gesture, event);
    case GesturePhase.End:
      return reduceEndGesture(state, gesture, event);
    case GesturePhase.Marquee:
      return reduceMarqueeGesture(state, gesture, event);
    case GesturePhase.Moving:
      return reduceMovingGesture(state, gesture, event);
    case GesturePhase.Panning:
      return reducePanningGesture(state, gesture, event);
    case GesturePhase.Placing:
      return reducePlacingGesture(state, gesture, event);
    case GesturePhase.Pressed:
      return reducePressedGesture(state, gesture, event);
    case GesturePhase.Resizing:
      return reduceResizingGesture(state, gesture, event);
    default:
      return exhaustiveGuard(gesture);
  }
};
