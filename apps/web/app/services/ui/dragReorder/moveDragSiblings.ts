import type { Drag } from "@/models/ui/dragReorder/Drag";
import type { Press } from "@/models/ui/dragReorder/Press";

import { getDragSiblingTranslate } from "@/services/ui/dragReorder/getDragSiblingTranslate";
import { takeOne } from "@esposter/shared";

// Only the rows between the old slot and the new change where they sit
export const moveDragSiblings = (press: Press, drag: Drag, targetIndex: number) => {
  for (let index = Math.min(targetIndex, drag.targetIndex); index <= Math.max(targetIndex, drag.targetIndex); index++) {
    if (index === press.index) continue;
    takeOne(press.items, index).style.translate = getDragSiblingTranslate(press, drag, targetIndex, index);
  }
};
