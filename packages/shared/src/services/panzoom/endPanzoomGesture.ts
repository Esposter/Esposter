import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { applyPanzoomStyles } from "#src/services/panzoom/applyPanzoomStyles";
import { dispatchPanzoomEvent } from "#src/services/panzoom/dispatchPanzoomEvent";
import { getPanzoomDrag } from "#src/services/panzoom/getPanzoomDrag";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { restorePanzoomStyles } from "#src/services/panzoom/restorePanzoomStyles";
import { takeOne } from "#src/util/array/takeOne";

// A pointer that was down leaves the gesture. Leaving the last one ends it, and a drag that passed its threshold swallows
// The click that follows. The pointer left when a pinch breaks carries on as a drag from where it is, without the threshold.
// The panzoomend event goes last, so a listener that destroys the panzoom has the final word on the styles
export const endPanzoomGesture = (context: PanzoomContext, event: PointerEvent): void => {
  const { element, options, pointers, state } = context;
  if (!pointers.has(event.pointerId)) return;

  pointers.delete(event.pointerId);
  if (context.drag?.isDragging) context.isClickSuppressed = true;
  context.drag = undefined;
  context.pinch = undefined;
  const remainingPoints = [...pointers.values()];
  if (remainingPoints.length === 1) context.drag = getPanzoomDrag(state, takeOne(remainingPoints, 0));
  if (pointers.size > 0) return;

  restorePanzoomStyles(context, ["user-select"]);
  applyPanzoomStyles(context);
  dispatchPanzoomEvent(element, PanzoomEventName.End, getPanzoomEventDetail(context, event), options);
};
