import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

import { TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { autoscrollDrag } from "@/services/ui/dragReorder/autoscrollDrag";
import { disposeDragReorder } from "@/services/ui/dragReorder/disposeDragReorder";
import { flushPendingSlides } from "@/services/ui/dragReorder/flushPendingSlides";
import { getDragReorderProps } from "@/services/ui/dragReorder/getDragReorderProps";
import { startDrag } from "@/services/ui/dragReorder/startDrag";

// Reorders a container's children by dragging one, as the pointer half of a reorderable list, whose keyboard half is
// `useReorder`. The props go on the container, whose element children are the rows, one for each value in order. A
// Mouse or pen drags once the press moves a few pixels, a finger once it rests, so a swipe still scrolls. The held row
// Follows the pointer inside the container while the rows it passes move aside to open its slot, the nearest scroller
// Scrolls while the pointer is near its edge, and on release every row slides to its new place while the new order is
// Handed to the call site. No row is ever moved in the DOM, so what is rendered is only ever what the values say.
// Escape or the browser taking the pointer back cancels, and a press in a field keeps its own meaning
export const useDragReorder = () => {
  const { pause: pauseAutoscroll, resume: resumeAutoscroll } = useRafFn(
    ({ delta }) => {
      autoscrollDrag(context, delta);
    },
    { immediate: false },
  );
  const { resume: resumeSlides } = useRafFn(
    () => {
      flushPendingSlides(context);
    },
    { immediate: false, once: true },
  );
  const { start: startTouchDelay, stop: stopTouchDelay } = useTimeoutFn(
    () => {
      if (context.press && !context.press.drag) startDrag(context, context.press);
    },
    TOUCH_DRAG_DELAY_MS,
    { immediate: false },
  );
  const context: DragReorderContext = {
    pauseAutoscroll,
    pendingSlides: new Set(),
    resumeAutoscroll,
    resumeSlides,
    startTouchDelay,
    stopTouchDelay,
  };

  tryOnScopeDispose(() => {
    disposeDragReorder(context);
  });
  // A handle, as a selector, limits a drag to a press inside it, for rows whose own content is pressed for other things
  return <T>(values: T[], onReorder: (values: T[]) => void, handle?: string) =>
    getDragReorderProps(context, values, onReorder, handle);
};
