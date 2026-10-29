import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";
import type { Press } from "@/models/ui/dragReorder/Press";

import { REORDER_GHOST_CLASS, REORDER_SLIDE_TRANSITION } from "@/services/ui/constants";
import { cancelDrag } from "@/services/ui/dragReorder/cancelDrag";
import { clearRowMotion } from "@/services/ui/dragReorder/clearRowMotion";
import { endPress } from "@/services/ui/dragReorder/endPress";
import { measureDrag } from "@/services/ui/dragReorder/measureDrag";
import { moveDrag } from "@/services/ui/dragReorder/moveDrag";
import { takeOne } from "@esposter/shared";

// Lifts the pressed row into a drag once the pointer has moved far enough, unless the list changed while it waited
export const startDrag = (context: DragReorderContext, currentPress: Press) => {
  // Rows that came or went while the press waited leave its index stale
  const { children } = currentPress.container;
  if (
    children.length !== currentPress.items.length ||
    currentPress.items.some((item, index) => children[index] !== item)
  ) {
    endPress(context, currentPress);
    return;
  }
  // A row still sliding from the last drop is measured where it is going
  clearRowMotion(currentPress.items);
  const drag = measureDrag(currentPress);
  currentPress.drag = drag;
  const item = takeOne(currentPress.items, currentPress.index);
  item.classList.add(REORDER_GHOST_CLASS);
  // The drag holds the pointer, so nothing else it passes over takes a hover or its events
  item.setPointerCapture(currentPress.pointerId);
  for (const [index, sibling] of currentPress.items.entries())
    if (index !== currentPress.index) sibling.style.transition = REORDER_SLIDE_TRANSITION;
  // Rows coming or going under a drag leave its slots stale, so it gives way
  currentPress.observer = new MutationObserver(() => {
    cancelDrag(context, currentPress);
  });
  currentPress.observer.observe(currentPress.container, { childList: true });
  moveDrag(context, currentPress, drag);
};
