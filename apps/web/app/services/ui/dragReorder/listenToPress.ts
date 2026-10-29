import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";
import type { Press } from "@/models/ui/dragReorder/Press";

import { DRAG_START_DISTANCE, LONG_PRESS_MOVE_TOLERANCE } from "@/services/ui/constants";
import { cancelDrag } from "@/services/ui/dragReorder/cancelDrag";
import { endPress } from "@/services/ui/dragReorder/endPress";
import { moveDrag } from "@/services/ui/dragReorder/moveDrag";
import { settleDrag } from "@/services/ui/dragReorder/settleDrag";
import { startDrag } from "@/services/ui/dragReorder/startDrag";
import { swallowNextClick } from "@/services/ui/dragReorder/swallowNextClick";

// The window listeners a press holds until it ends, for the pointer's travel, its release and cancel, Escape, the
// Browser's own drag and selection, and the scrolls that move the rows under a pointer that may not move at all
export const listenToPress = (context: DragReorderContext, currentPress: Press) => {
  const options = { capture: true, signal: currentPress.listeners.signal };
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerId !== currentPress.pointerId) return;
      currentPress.pointerY = event.clientY;
      if (currentPress.drag) moveDrag(context, currentPress, currentPress.drag);
      else if (!currentPress.isCancelled) {
        const distance = Math.hypot(event.clientX - currentPress.startX, event.clientY - currentPress.startY);
        // A finger moving before it has rested is scrolling, which the browser goes on to do
        if (currentPress.pointerType === "touch") {
          if (distance > LONG_PRESS_MOVE_TOLERANCE) endPress(context, currentPress);
        } else if (distance >= DRAG_START_DISTANCE) startDrag(context, currentPress);
      }
    },
    options,
  );
  window.addEventListener(
    "pointerup",
    (event) => {
      if (event.pointerId !== currentPress.pointerId) return;
      if (currentPress.drag) {
        settleDrag(context, currentPress, currentPress.drag, currentPress.drag.targetIndex);
        swallowNextClick(context);
      } else if (currentPress.isCancelled) swallowNextClick(context);
      endPress(context, currentPress);
    },
    options,
  );
  // The browser took the pointer back: a scroll began, or the system needed it
  window.addEventListener(
    "pointercancel",
    (event) => {
      if (event.pointerId !== currentPress.pointerId) return;
      cancelDrag(context, currentPress);
      endPress(context, currentPress);
    },
    options,
  );
  // Escape cancels the drag and goes no further, so a dialog the list sits in stays open
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape" || !currentPress.drag) return;
      event.preventDefault();
      event.stopPropagation();
      cancelDrag(context, currentPress);
    },
    options,
  );
  // The browser's own drag of a link, an image or selected text, and a text selection, would each take the pointer
  window.addEventListener(
    "dragstart",
    (event) => {
      event.preventDefault();
    },
    options,
  );
  window.addEventListener(
    "selectstart",
    (event) => {
      event.preventDefault();
    },
    options,
  );
  // The wheel or a scroll of our own moves the rows under a pointer that may not move at all
  window.addEventListener(
    "scroll",
    () => {
      if (currentPress.drag) moveDrag(context, currentPress, currentPress.drag);
    },
    { ...options, passive: true },
  );
};
