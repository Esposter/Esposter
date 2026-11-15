import type { Drag } from "#src/models/ui/dragReorder/Drag";
import type { DragReorderContext } from "#src/models/ui/dragReorder/DragReorderContext";
import type { Press } from "#src/models/ui/dragReorder/Press";

import { REORDER_GHOST_CLASS } from "#src/services/ui/constants";
import { slideDrag } from "#src/services/ui/dragReorder/slideDrag";
import { takeOne } from "@esposter/shared";

// Ends the drag and hands the new order to the call site, and the rows slide to their places once it has rendered
export const settleDrag = (context: DragReorderContext, currentPress: Press, drag: Drag, toIndex: number) => {
  currentPress.drag = undefined;
  currentPress.observer?.disconnect();
  context.pauseAutoscroll();
  const fromTops = currentPress.items.map((item) => item.getBoundingClientRect().top);
  takeOne(currentPress.items, currentPress.index).classList.remove(REORDER_GHOST_CLASS);
  if (toIndex !== currentPress.index) currentPress.reorder(toIndex);
  context.pendingSlides.add(() => {
    slideDrag(context, currentPress, drag, fromTops);
  });
  context.resumeSlides();
};
