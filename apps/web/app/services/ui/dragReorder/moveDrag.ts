import type { Drag } from "#src/models/ui/dragReorder/Drag";
import type { DragReorderContext } from "#src/models/ui/dragReorder/DragReorderContext";
import type { Press } from "#src/models/ui/dragReorder/Press";

import { getAutoscroll } from "#src/services/ui/dragReorder/getAutoscroll";
import { getDragTargetIndex } from "#src/services/ui/dragReorder/getDragTargetIndex";
import { getDragTranslate } from "#src/services/ui/dragReorder/getDragTranslate";
import { moveDragSiblings } from "#src/services/ui/dragReorder/moveDragSiblings";
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
