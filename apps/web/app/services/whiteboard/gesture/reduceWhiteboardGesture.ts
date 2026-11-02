import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { reduceArrowGesture } from "@/services/whiteboard/gesture/reduceArrowGesture";
import { reduceDrawingGesture } from "@/services/whiteboard/gesture/reduceDrawingGesture";
import { reduceMarqueeGesture } from "@/services/whiteboard/gesture/reduceMarqueeGesture";
import { reduceMovingGesture } from "@/services/whiteboard/gesture/reduceMovingGesture";
import { reducePanningGesture } from "@/services/whiteboard/gesture/reducePanningGesture";
import { reducePressedGesture } from "@/services/whiteboard/gesture/reducePressedGesture";
import { reduceResizingGesture } from "@/services/whiteboard/gesture/reduceResizingGesture";
import { startWhiteboardGesture } from "@/services/whiteboard/gesture/startWhiteboardGesture";
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
    case GesturePhase.Drawing:
      return reduceDrawingGesture(state, gesture, event);
    case GesturePhase.Marquee:
      return reduceMarqueeGesture(state, gesture, event);
    case GesturePhase.Moving:
      return reduceMovingGesture(state, gesture, event);
    case GesturePhase.Panning:
      return reducePanningGesture(state, gesture, event);
    case GesturePhase.Pressed:
      return reducePressedGesture(state, gesture, event);
    case GesturePhase.Resizing:
      return reduceResizingGesture(state, gesture, event);
    default:
      return exhaustiveGuard(gesture);
  }
};
