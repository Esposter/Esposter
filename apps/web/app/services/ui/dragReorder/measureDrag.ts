import type { Drag } from "@/models/ui/dragReorder/Drag";
import type { Press } from "@/models/ui/dragReorder/Press";

import { getDragOffsets } from "@/services/ui/dragReorder/getDragOffsets";
import { getDragScale } from "@/services/ui/dragReorder/getDragScale";
import { getDragShift } from "@/services/ui/dragReorder/getDragShift";
import { getScrollers } from "@/services/ui/dragReorder/getScrollers";
import { takeOne } from "@esposter/shared";

// Where each row sits as the drag starts, which the slots and the held row's travel are measured from
export const measureDrag = (press: Press): Drag => {
  const rects = press.items.map((item) => item.getBoundingClientRect());
  const rect = takeOne(rects, press.index);
  return {
    layoutTop: rect.top,
    offsets: getDragOffsets(rects, press.index),
    scale: getDragScale(press.container),
    scrollers: getScrollers(press.container),
    shift: getDragShift(rects, press.index),
    targetIndex: press.index,
    translate: 0,
  };
};
