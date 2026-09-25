import type { Item } from "@/models/shared/Item";
import type { UiContextMenuPoint } from "@/models/ui/UiContextMenuPoint";

import { CONTEXT_MENU_EDITABLE_SELECTOR, LONG_PRESS_MOVE_TOLERANCE, LONG_PRESS_MS } from "@/services/ui/constants";
import { useContextMenuStore } from "@/store/ui/contextMenu";

const swallowClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};
// Gives an element a context menu of the items its overflow button shows, so the two never disagree. The props go on
// The element: a right-click opens the menu at the pointer, a long press on a touch screen at the finger, and the menu
// Key or Shift+F10 at the element's corner. Holding Shift, or pressing in a field, leaves the browser's own menu
export const useContextMenu = () => {
  const contextMenuStore = useContextMenuStore();
  const { contextMenu } = storeToRefs(contextMenuStore);
  const { openContextMenu } = contextMenuStore;
  const checkIsContextMenuOpen = (key: string) => contextMenu.value?.key === key;
  // One finger presses at a time, so one press is tracked across every element
  let press: (UiContextMenuPoint & { onOpen: (point: UiContextMenuPoint) => void }) | undefined;
  // A long press opens the menu under a finger still down, so the click its lifting raises is swallowed. A listener
  // For that one click rather than a prop, since a component that counts a click listener among its props as
  // Clickable, a capture one included, would draw every target as a link
  let swallowingOpener: HTMLElement | undefined;
  const stopSwallowing = () => {
    swallowingOpener?.removeEventListener("click", swallowClick, { capture: true });
    swallowingOpener = undefined;
  };
  const { start, stop } = useTimeoutFn(
    () => {
      if (!press) return;
      swallowingOpener = press.opener;
      swallowingOpener.addEventListener("click", swallowClick, { capture: true, once: true });
      const { onOpen, ...point } = press;
      press = undefined;
      onOpen(point);
    },
    LONG_PRESS_MS,
    { immediate: false },
  );
  const cancelPress = () => {
    press = undefined;
    stop();
  };
  // A target whose items cost too much to build for every row hands the point on instead, to whatever builds them
  const getContextMenuGestureProps = (onOpen: (point: UiContextMenuPoint) => void) => {
    const openAtCorner = (opener: HTMLElement) => {
      const { bottom, left } = opener.getBoundingClientRect();
      onOpen({ opener, x: left, y: bottom });
    };
    return {
      onContextmenu: (event: MouseEvent) => {
        if (
          event.shiftKey ||
          !(event.currentTarget instanceof HTMLElement) ||
          (event.target instanceof Element && event.target.closest(CONTEXT_MENU_EDITABLE_SELECTOR))
        )
          return;
        event.preventDefault();
        // The menu key raises the same event with no pointer behind it, so it opens at the element instead
        const isFromPointer = event.button === 2 || ("pointerType" in event && Boolean(event.pointerType));
        if (isFromPointer) onOpen({ opener: event.currentTarget, x: event.clientX, y: event.clientY });
        else openAtCorner(event.currentTarget);
      },
      onKeydown: (event: KeyboardEvent) => {
        stopSwallowing();
        if (event.target !== event.currentTarget || !(event.currentTarget instanceof HTMLElement)) return;
        if (event.key !== "ContextMenu" && !(event.key === "F10" && event.shiftKey)) return;
        event.preventDefault();
        openAtCorner(event.currentTarget);
      },
      onPointercancel: cancelPress,
      onPointerdown: (event: PointerEvent) => {
        // A long press some browsers raise no click after would otherwise leave its swallow for the next click from any
        // Pointer or key, so every press clears it
        stopSwallowing();
        if (event.pointerType !== "touch" || !(event.currentTarget instanceof HTMLElement)) return;
        press = { onOpen, opener: event.currentTarget, x: event.clientX, y: event.clientY };
        start();
      },
      onPointermove: (event: PointerEvent) => {
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_MOVE_TOLERANCE)
          cancelPress();
      },
      onPointerup: cancelPress,
    };
  };
  const getContextMenuProps = (key: string, getItems: () => Item[]) =>
    getContextMenuGestureProps((point) => {
      const items = getItems();
      if (items.length > 0) openContextMenu({ ...point, items, key });
    });
  return { checkIsContextMenuOpen, getContextMenuGestureProps, getContextMenuProps };
};
