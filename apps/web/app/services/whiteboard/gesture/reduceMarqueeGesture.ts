import type { GestureMarquee } from "@/models/whiteboard/GestureMarquee";
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureResult } from "@/models/whiteboard/WhiteboardGestureResult";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { getMarqueeSelection } from "@/services/whiteboard/gesture/getMarqueeSelection";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { exhaustiveGuard } from "@esposter/shared";
import { getPointsBounds } from "headless-block-editor";

// A marquee selects every element it fully covers, along with the selection it began with. A cancel gives back that selection
export const reduceMarqueeGesture = (
  state: WhiteboardGestureState,
  gesture: GestureMarquee,
  event: GesturePointerEvent,
): WhiteboardGestureResult => {
  switch (event.action) {
    case GesturePointerAction.Cancel:
      return { operations: [], state: { ...state, gesture: undefined, selectedIds: gesture.baseIds } };
    case GesturePointerAction.Down:
      return { operations: [], state };
    case GesturePointerAction.Move:
    case GesturePointerAction.Up: {
      const current = getWorldPoint(event.screen, state.viewport);
      const selectedIds = getMarqueeSelection(
        state.document,
        gesture.baseIds,
        getPointsBounds([gesture.origin, current]),
      );
      if (event.action === GesturePointerAction.Up)
        return { operations: [], state: { ...state, gesture: undefined, selectedIds } };

      return { operations: [], state: { ...state, gesture: { ...gesture, current }, selectedIds } };
    }
    default:
      return exhaustiveGuard(event.action);
  }
};
