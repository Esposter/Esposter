import type { Drag } from "@/models/ui/dragReorder/Drag";
import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";
import type { Press } from "@/models/ui/dragReorder/Press";

import { REORDER_SLIDE_TRANSITION } from "@/services/ui/constants";
import { clearRowMotion } from "@/services/ui/dragReorder/clearRowMotion";
import { getDragSlides } from "@/services/ui/dragReorder/getDragSlides";
import { releaseRowTransition } from "@/services/ui/dragReorder/releaseRowTransition";
import { takeOne } from "@esposter/shared";

// Every row slides from where it was let go to where it now sits, and the styles the drag set come off again once
// Each has arrived
export const slideDrag = (context: DragReorderContext, currentPress: Press, drag: Drag, fromTops: number[]) => {
  // A drag begun in the container since holds its rows
  if (context.press?.drag && context.press.container === currentPress.container) return;
  clearRowMotion(currentPress.items);
  const slides = getDragSlides(currentPress.items, fromTops, drag.scale);
  for (const [index, item] of currentPress.items.entries()) {
    const offset = takeOne(slides, index);
    if (offset) item.style.translate = `0 ${offset}px`;
  }
  // Where each row starts from is laid out before it is let go, or it would jump there and not slide
  currentPress.container.getBoundingClientRect();
  for (const [index, item] of currentPress.items.entries()) {
    if (!takeOne(slides, index)) {
      item.style.transition = "";
      continue;
    }
    item.style.transition = REORDER_SLIDE_TRANSITION;
    item.style.translate = "";
    // oxlint-disable-next-line typescript/no-floating-promises -- releaseRowTransition clears the row once its animations settle, and a drag's slide has nothing to await it
    releaseRowTransition(context, item);
  }
};
