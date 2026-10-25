import type { Drag } from "@/models/ui/Drag";
import type { Press } from "@/models/ui/Press";

import { getMovedItems } from "@/services/shared/getMovedItems";
import {
  DRAG_AUTOSCROLL_SPEED,
  DRAG_IGNORE_SELECTOR,
  DRAG_START_DISTANCE,
  LONG_PRESS_MOVE_TOLERANCE,
  REORDER_GHOST_CLASS,
  REORDER_SLIDE_TRANSITION,
  TOUCH_DRAG_DELAY_MS,
} from "@/services/ui/constants";
import { getAutoscroll } from "@/services/ui/getAutoscroll";
import { getChildOf } from "@/services/ui/getChildOf";
import { getScrollers } from "@/services/ui/getScrollers";
import { swallowClick } from "@/services/ui/swallowClick";
import { takeOne } from "@esposter/shared";

// A press an inner container took, so an outer one it bubbles through leaves it alone
const claimedPresses = new WeakSet<PointerEvent>();

// Reorders a container's children by dragging one, as the pointer half of a reorderable list, whose keyboard half is
// `useReorder`. The props go on the container, whose element children are the rows, one for each value in order. A
// Mouse or pen drags once the press moves a few pixels, a finger once it rests, so a swipe still scrolls. The held row
// Follows the pointer inside the container while the rows it passes move aside to open its slot, the nearest scroller
// Scrolls while the pointer is near its edge, and on release every row slides to its new place while the new order is
// Handed to the call site. No row is ever moved in the DOM, so what is rendered is only ever what the values say.
// Escape or the browser taking the pointer back cancels, and a press in a field keeps its own meaning
export const useDragReorder = () => {
  let press: Press | undefined;
  let swallowing: AbortController | undefined;
  const stopSwallowing = () => {
    swallowing?.abort();
    swallowing = undefined;
  };
  // The click a release raises after a drag, and only that one: a press or a key starts something whose click is its
  // Own, since a touch drag raises none at all
  const swallowNextClick = () => {
    stopSwallowing();
    swallowing = new AbortController();
    const options = { capture: true, signal: swallowing.signal };
    window.addEventListener(
      "click",
      (event) => {
        swallowClick(event);
        stopSwallowing();
      },
      options,
    );
    window.addEventListener("keydown", stopSwallowing, options);
    window.addEventListener("pointerdown", stopSwallowing, options);
  };
  const { pause: pauseAutoscroll, resume: resumeAutoscroll } = useRafFn(
    ({ delta }) => {
      const autoscroll = press?.drag && getAutoscroll(press.drag.scrollers, press.pointerY);
      if (!press?.drag || !autoscroll) {
        pauseAutoscroll();
        return;
      }
      // At least a pixel a frame, since a browser rounds a smaller scroll away. Instant, past a smooth scroll-behavior
      // Easing each step away
      const distance = Math.max(Math.abs(autoscroll.speed) * DRAG_AUTOSCROLL_SPEED * delta, 1);
      autoscroll.scroller.scrollBy({ behavior: "instant", top: Math.sign(autoscroll.speed) * distance });
      move(press, press.drag);
    },
    { immediate: false },
  );
  const move = (currentPress: Press, drag: Drag) => {
    const item = takeOne(currentPress.items, currentPress.index);
    const scrolled = drag.layoutTop - (item.getBoundingClientRect().top - drag.translate);
    drag.translate = Math.min(
      Math.max(currentPress.pointerY - currentPress.startY + scrolled, takeOne(drag.offsets, 0)),
      takeOne(drag.offsets, drag.offsets.length - 1),
    );
    item.style.translate = `0 ${drag.translate / drag.scale}px`;
    // The slot nearest where the row is held, so rows of any height change places once, midway
    let targetIndex = 0;
    for (const [index, offset] of drag.offsets.entries())
      if (Math.abs(drag.translate - offset) < Math.abs(drag.translate - takeOne(drag.offsets, targetIndex)))
        targetIndex = index;
    if (targetIndex !== drag.targetIndex) {
      // Only the rows between the old slot and the new change where they sit
      for (
        let index = Math.min(targetIndex, drag.targetIndex);
        index <= Math.max(targetIndex, drag.targetIndex);
        index++
      ) {
        if (index === currentPress.index) continue;
        const sibling = takeOne(currentPress.items, index);
        if (currentPress.index < index && index <= targetIndex)
          sibling.style.translate = `0 ${-drag.shift / drag.scale}px`;
        else if (targetIndex <= index && index < currentPress.index)
          sibling.style.translate = `0 ${drag.shift / drag.scale}px`;
        else sibling.style.translate = "";
      }
      drag.targetIndex = targetIndex;
    }
    if (getAutoscroll(drag.scrollers, currentPress.pointerY)) resumeAutoscroll();
  };
  const endPress = (currentPress: Press) => {
    currentPress.listeners.abort();
    currentPress.observer?.disconnect();
    stopTouchDelay();
    if (press === currentPress) press = undefined;
  };
  // The slide's transition comes off a row once it has arrived, at once under reduced motion, which runs none, and
  // Never off a row a newer drag already holds
  const releaseTransition = async (item: HTMLElement) => {
    await Promise.allSettled(item.getAnimations().map(({ finished }) => finished));
    if (!press?.drag || !press.items.includes(item)) item.style.transition = "";
  };
  // Every row slides from where it was let go to where it now sits, and the styles the drag set come off again once
  // Each has arrived
  const slide = (currentPress: Press, drag: Drag, fromTops: number[]) => {
    // A drag begun in the container since holds its rows
    if (press?.drag && press.container === currentPress.container) return;
    for (const item of currentPress.items) {
      item.style.transition = "none";
      item.style.translate = "";
    }
    const slides = currentPress.items.map((item, index) =>
      item.isConnected ? (takeOne(fromTops, index) - item.getBoundingClientRect().top) / drag.scale : 0,
    );
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
      releaseTransition(item);
    }
  };
  // A call site renders the new order on its own schedule — an optimistic store a few microtasks on — so the rows keep
  // Where they were let go until the next frame, which is painted only after that render has landed, and slide from
  // There
  const pendingSlides = new Set<() => void>();
  const { resume: resumeSlides } = useRafFn(
    () => {
      for (const pendingSlide of pendingSlides) pendingSlide();
      pendingSlides.clear();
    },
    { immediate: false, once: true },
  );
  const settle = (currentPress: Press, drag: Drag, toIndex: number) => {
    currentPress.drag = undefined;
    currentPress.observer?.disconnect();
    pauseAutoscroll();
    const fromTops = currentPress.items.map((item) => item.getBoundingClientRect().top);
    takeOne(currentPress.items, currentPress.index).classList.remove(REORDER_GHOST_CLASS);
    if (toIndex !== currentPress.index) currentPress.reorder(toIndex);
    pendingSlides.add(() => {
      slide(currentPress, drag, fromTops);
    });
    resumeSlides();
  };
  // Every row goes back, and the release still to come raises a click that is swallowed like a drop's
  const cancel = (currentPress: Press) => {
    if (!currentPress.drag) return;
    currentPress.isCancelled = true;
    settle(currentPress, currentPress.drag, currentPress.index);
  };
  const startDrag = (currentPress: Press) => {
    // Rows that came or went while the press waited leave its index stale
    const { children } = currentPress.container;
    if (
      children.length !== currentPress.items.length ||
      currentPress.items.some((item, index) => children[index] !== item)
    ) {
      endPress(currentPress);
      return;
    }
    // A row still sliding from the last drop is measured where it is going
    for (const item of currentPress.items) {
      item.style.transition = "none";
      item.style.translate = "";
    }
    const rects = currentPress.items.map((item) => item.getBoundingClientRect());
    const rect = takeOne(rects, currentPress.index);
    const nextRect = rects[currentPress.index + 1];
    const previousRect = rects[currentPress.index - 1];
    const containerHeight = currentPress.container.offsetHeight;
    currentPress.drag = {
      layoutTop: rect.top,
      offsets: rects.map(({ bottom, top }, index) => {
        if (index < currentPress.index) return top - rect.top;
        else if (index > currentPress.index) return bottom - rect.bottom;
        else return 0;
      }),
      scale: containerHeight > 0 ? currentPress.container.getBoundingClientRect().height / containerHeight : 1,
      scrollers: getScrollers(currentPress.container),
      shift: nextRect ? nextRect.top - rect.top : previousRect ? rect.bottom - previousRect.bottom : rect.height,
      targetIndex: currentPress.index,
      translate: 0,
    };
    const item = takeOne(currentPress.items, currentPress.index);
    item.classList.add(REORDER_GHOST_CLASS);
    // The drag holds the pointer, so nothing else it passes over takes a hover or its events
    item.setPointerCapture(currentPress.pointerId);
    for (const [index, sibling] of currentPress.items.entries())
      if (index !== currentPress.index) sibling.style.transition = REORDER_SLIDE_TRANSITION;
    // Rows coming or going under a drag leave its slots stale, so it gives way
    currentPress.observer = new MutationObserver(() => {
      cancel(currentPress);
    });
    currentPress.observer.observe(currentPress.container, { childList: true });
    move(currentPress, currentPress.drag);
  };
  const { start: startTouchDelay, stop: stopTouchDelay } = useTimeoutFn(
    () => {
      if (press && !press.drag) startDrag(press);
    },
    TOUCH_DRAG_DELAY_MS,
    { immediate: false },
  );
  const listen = (currentPress: Press) => {
    const options = { capture: true, signal: currentPress.listeners.signal };
    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerId !== currentPress.pointerId) return;
        currentPress.pointerY = event.clientY;
        if (currentPress.drag) move(currentPress, currentPress.drag);
        else if (!currentPress.isCancelled) {
          const distance = Math.hypot(event.clientX - currentPress.startX, event.clientY - currentPress.startY);
          // A finger moving before it has rested is scrolling, which the browser goes on to do
          if (currentPress.pointerType === "touch") {
            if (distance > LONG_PRESS_MOVE_TOLERANCE) endPress(currentPress);
          } else if (distance >= DRAG_START_DISTANCE) startDrag(currentPress);
        }
      },
      options,
    );
    window.addEventListener(
      "pointerup",
      (event) => {
        if (event.pointerId !== currentPress.pointerId) return;
        if (currentPress.drag) {
          settle(currentPress, currentPress.drag, currentPress.drag.targetIndex);
          swallowNextClick();
        } else if (currentPress.isCancelled) swallowNextClick();
        endPress(currentPress);
      },
      options,
    );
    // The browser took the pointer back: a scroll began, or the system needed it
    window.addEventListener(
      "pointercancel",
      (event) => {
        if (event.pointerId !== currentPress.pointerId) return;
        cancel(currentPress);
        endPress(currentPress);
      },
      options,
    );
    // Escape cancels the drag and goes no further, so a dialog the list sits in stays open
    window.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape" || !currentPress.drag) return;
        event.preventDefault();
        event.stopPropagation();
        cancel(currentPress);
      },
      options,
    );
    // The browser's own drag of a link, an image or selected text, and a text selection, would each take the pointer
    window.addEventListener(
      "dragstart",
      (event) => {
        event.preventDefault();
      },
      options,
    );
    window.addEventListener(
      "selectstart",
      (event) => {
        event.preventDefault();
      },
      options,
    );
    // The wheel or a scroll of our own moves the rows under a pointer that may not move at all
    window.addEventListener(
      "scroll",
      () => {
        if (currentPress.drag) move(currentPress, currentPress.drag);
      },
      { ...options, passive: true },
    );
  };

  tryOnScopeDispose(() => {
    stopSwallowing();
    if (!press) return;
    for (const item of press.items) {
      item.classList.remove(REORDER_GHOST_CLASS);
      item.style.transition = "";
      item.style.translate = "";
    }
    endPress(press);
  });

  // A handle, as a selector, limits a drag to a press inside it, for rows whose own content is pressed for other things
  return <T>(values: T[], onReorder: (values: T[]) => void, handle?: string) => ({
    onPointerdown: (event: PointerEvent) => {
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
      // A press whose release never reached the page, outside the window, gives way to this one
      if (press) {
        cancel(press);
        endPress(press);
      }
      const index = items.indexOf(item);
      press = {
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
      listen(press);
      if (event.pointerType === "touch") startTouchDelay();
    },
    // A touch drag holds the page still under the finger. The container listens itself, before a touch begins, since a
    // Browser decides whether a touch may scroll as it starts, from the listeners it finds there then
    onTouchmove: (event: TouchEvent) => {
      if (press?.drag && event.cancelable) event.preventDefault();
    },
  });
};
