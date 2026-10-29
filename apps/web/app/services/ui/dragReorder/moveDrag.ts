import type { Drag } from "@/models/ui/dragReorder/Drag";
import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";
import type { Press } from "@/models/ui/dragReorder/Press";

import { getAutoscroll } from "@/services/ui/dragReorder/getAutoscroll";
import { getDragTargetIndex } from "@/services/ui/dragReorder/getDragTargetIndex";
import { getDragTranslate } from "@/services/ui/dragReorder/getDragTranslate";
import { moveDragSiblings } from "@/services/ui/dragReorder/moveDragSiblings";
import { takeOne } from "@esposter/shared";

// Moves the held row to the pointer and the rows it passes aside, then asks for the autoscroll a pointer at an edge needs
export const moveDrag = (context: DragReorderContext, press: Press, drag: Drag) => {
  drag.translate = getDragTranslate(press, drag);
  takeOne(press.items, press.index).style.translate = `0 ${drag.translate / drag.scale}px`;
  const targetIndex = getDragTargetIndex(drag.offsets, drag.translate);
  if (targetIndex !== drag.targetIndex) {
    moveDragSiblings(press, drag, targetIndex);
    drag.targetIndex = targetIndex;
  }
  if (getAutoscroll(drag.scrollers, press.pointerY)) context.resumeAutoscroll();
};
