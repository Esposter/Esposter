import type { DragReorderContext } from "@/models/ui/DragReorderContext";

import { DRAG_AUTOSCROLL_SPEED } from "@/services/ui/constants";
import { getAutoscroll } from "@/services/ui/dragReorder/getAutoscroll";
import { moveDrag } from "@/services/ui/dragReorder/moveDrag";

// Scrolls the scroller the pointer is near the edge of, a frame at a time, and moves the held row with it
export const autoscrollDrag = (context: DragReorderContext, delta: number) => {
  const { press } = context;
  const autoscroll = press?.drag && getAutoscroll(press.drag.scrollers, press.pointerY);
  if (!press?.drag || !autoscroll) {
    context.pauseAutoscroll();
    return;
  }
  // At least a pixel a frame, since a browser rounds a smaller scroll away. Instant, past a smooth scroll-behavior
  // Easing each step away
  const distance = Math.max(Math.abs(autoscroll.speed) * DRAG_AUTOSCROLL_SPEED * delta, 1);
  autoscroll.scroller.scrollBy({ behavior: "instant", top: Math.sign(autoscroll.speed) * distance });
  moveDrag(context, press, press.drag);
};
