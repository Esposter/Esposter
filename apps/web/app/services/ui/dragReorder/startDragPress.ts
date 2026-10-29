import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";
import type { Press } from "@/models/ui/dragReorder/Press";

import { getMovedItems } from "@/services/shared/getMovedItems";
import { DRAG_IGNORE_SELECTOR } from "@/services/ui/constants";
import { cancelDrag } from "@/services/ui/dragReorder/cancelDrag";
import { claimedPresses } from "@/services/ui/dragReorder/claimedPresses";
import { endPress } from "@/services/ui/dragReorder/endPress";
import { getChildOf } from "@/services/ui/dragReorder/getChildOf";
import { listenToPress } from "@/services/ui/dragReorder/listenToPress";

// Takes a press on a row of the container, when it is a primary press on the row's handle, and makes it the press in
// Progress, ending the one before it, whose release never reached the page
export const startDragPress = <T>(
  context: DragReorderContext,
  event: PointerEvent,
  values: T[],
  onReorder: (values: T[]) => void,
  handle?: string,
) => {
  if (
    claimedPresses.has(event) ||
    !event.isPrimary ||
    event.button !== 0 ||
    !(event.currentTarget instanceof HTMLElement) ||
    !(event.target instanceof Element)
  )
    return;
  const container = event.currentTarget;
  const items = [...container.children].filter((child) => child instanceof HTMLElement);
  const item = getChildOf(container, event.target);
  if (!(item instanceof HTMLElement) || items.length !== values.length) return;
  const handleElement = handle ? event.target.closest(handle) : item;
  const ignoredElement = event.target.closest(DRAG_IGNORE_SELECTOR);
  if (!handleElement || !item.contains(handleElement) || (ignoredElement && item.contains(ignoredElement))) return;
  claimedPresses.add(event);
  const previousPress = context.press;
  if (previousPress) {
    cancelDrag(context, previousPress);
    endPress(context, previousPress);
  }
  const index = items.indexOf(item);
  const press: Press = {
    container,
    index,
    isCancelled: false,
    items,
    listeners: new AbortController(),
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    pointerY: event.clientY,
    reorder: (toIndex) => {
      const movedValues = getMovedItems(values, index, toIndex);
      if (movedValues) onReorder(movedValues);
    },
    startX: event.clientX,
    startY: event.clientY,
  };
  context.press = press;
  listenToPress(context, press);
  if (event.pointerType === "touch") context.startTouchDelay();
};
