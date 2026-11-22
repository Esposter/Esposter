import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";

import { endPanzoomGesture } from "#src/services/panzoom/endPanzoomGesture";
import { getPanzoomTarget } from "#src/services/panzoom/getPanzoomTarget";
import { movePanzoomGesture } from "#src/services/panzoom/movePanzoomGesture";
import { startPanzoomGesture } from "#src/services/panzoom/startPanzoomGesture";

// The target is an HTMLElement or an SVGElement, a union with no typed pointerdown overload, so its listener is handed a plain
// Event. A pointer down is a PointerEvent, which the check names
const checkIsPointerEvent = (event: Event): event is PointerEvent => "pointerId" in event;

// Listens on the target for pointer downs and clicks, and on the element's document for the moves and the ends of its pointers.
// Every listener is held by one signal, so aborting it removes them all. The click after a drag is swallowed at the target
export const bindPanzoom = (context: PanzoomContext, signal: AbortSignal): void => {
  const target = getPanzoomTarget(context);
  const { ownerDocument } = context.element;
  target.addEventListener(
    "pointerdown",
    (event) => {
      if (checkIsPointerEvent(event)) startPanzoomGesture(context, event);
    },
    { signal },
  );
  target.addEventListener(
    "click",
    (event) => {
      if (!context.isClickSuppressed) return;

      context.isClickSuppressed = false;
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true, signal },
  );
  ownerDocument.addEventListener(
    "pointermove",
    (event) => {
      movePanzoomGesture(context, event);
    },
    { passive: true, signal },
  );
  ownerDocument.addEventListener(
    "pointerup",
    (event) => {
      endPanzoomGesture(context, event);
    },
    { passive: true, signal },
  );
  ownerDocument.addEventListener(
    "pointercancel",
    (event) => {
      endPanzoomGesture(context, event);
    },
    { passive: true, signal },
  );
};
