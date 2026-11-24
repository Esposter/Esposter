import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { checkIsPanzoomExcluded } from "#src/services/panzoom/checkIsPanzoomExcluded";
import { dispatchPanzoomEvent } from "#src/services/panzoom/dispatchPanzoomEvent";
import { getPanzoomDrag } from "#src/services/panzoom/getPanzoomDrag";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { getPanzoomPinchFrame } from "#src/services/panzoom/getPanzoomPinchFrame";
import { getPanzoomTarget } from "#src/services/panzoom/getPanzoomTarget";
import { writePanzoomStyle } from "#src/services/panzoom/writePanzoomStyle";

// An element of any window carries `closest`, where `instanceof` would fail on one made in another window
const checkIsElement = (target: EventTarget | null): target is Element => target !== null && "closest" in target;

// A pointer that the exclusions and the filter let through joins the gesture. One pointer starts a drag, and a second
// Turns the gesture into a pinch. A pointer past the second is not tracked. Every press clears the click suppression a
// Drag left armed
export const startPanzoomGesture = (context: PanzoomContext, event: PointerEvent): void => {
  const { element, options, pointers, state } = context;
  context.isClickSuppressed = false;
  if (pointers.size >= 2) return;
  if (!checkIsElement(event.target) || checkIsPanzoomExcluded(event.target, options)) return;
  const { filter } = options;
  if (filter && !filter(event)) return;

  const point = { x: event.clientX, y: event.clientY };
  pointers.set(event.pointerId, point);
  getPanzoomTarget(context).setPointerCapture(event.pointerId);
  if (options.handleStartEvent) options.handleStartEvent(event);
  else {
    event.preventDefault();
    event.stopPropagation();
  }

  if (pointers.size === 1) context.drag = getPanzoomDrag(state, point);
  if (pointers.size === 2) {
    const frame = getPanzoomPinchFrame(pointers);
    if (frame.distance > 0) {
      context.drag = undefined;
      context.pinch = { midpoint: frame.midpoint, startDistance: frame.distance, startScale: state.scale };
    }
  }

  writePanzoomStyle(context, element, "user-select", "none");
  if (!options.disablePan && options.panCursor)
    writePanzoomStyle(context, getPanzoomTarget(context), "cursor", options.panCursor);

  dispatchPanzoomEvent(context, PanzoomEventName.Start, getPanzoomEventDetail(context, event), options);
};
