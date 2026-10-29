import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

import { startDragPress } from "@/services/ui/dragReorder/startDragPress";

// The props a reorderable container takes, with a handle as a selector to limit a drag to a press inside it, for rows
// Whose own content is pressed for other things
export const getDragReorderProps = <T>(
  context: DragReorderContext,
  values: T[],
  onReorder: (values: T[]) => void,
  handle?: string,
) => ({
  onPointerdown: (event: PointerEvent) => {
    startDragPress(context, event, values, onReorder, handle);
  },
  // A touch drag holds the page still under the finger. The container listens itself, before a touch begins, since a
  // Browser decides whether a touch may scroll as it starts, from the listeners it finds there then
  onTouchmove: (event: TouchEvent) => {
    if (context.press?.drag && event.cancelable) event.preventDefault();
  },
});
