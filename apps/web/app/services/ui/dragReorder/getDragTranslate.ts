import type { Drag } from "@/models/ui/dragReorder/Drag";
import type { Press } from "@/models/ui/dragReorder/Press";

import { takeOne } from "@esposter/shared";

// Where the held row is now: the pointer's travel from its press, with any scroll under the row since added back, held
// Between the first slot and the last
export const getDragTranslate = (press: Press, drag: Drag) => {
  const item = takeOne(press.items, press.index);
  const scrolled = drag.layoutTop - (item.getBoundingClientRect().top - drag.translate);
  return Math.min(
    Math.max(press.pointerY - press.startY + scrolled, takeOne(drag.offsets, 0)),
    takeOne(drag.offsets, drag.offsets.length - 1),
  );
};
