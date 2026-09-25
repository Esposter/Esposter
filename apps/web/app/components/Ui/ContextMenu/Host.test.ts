// @vitest-environment nuxt
import type { Item } from "@/models/shared/Item";

import UiContextMenuHost from "@/components/Ui/ContextMenu/Host.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { useContextMenu } from "@/composables/ui/useContextMenu";
import { UiStyles } from "@/models/ui/UiStyle";
import { LONG_PRESS_MOVE_TOLERANCE, LONG_PRESS_MS } from "@/services/ui/constants";
import { useContextMenuStore } from "@/store/ui/contextMenu";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

const rightClick = (element: Element, init: MouseEventInit = {}) => {
  const event = new MouseEvent("contextmenu", { bubbles: true, button: 2, cancelable: true, ...init });
  element.dispatchEvent(event);
  return event;
};

describe("uiContextMenuHost", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const key = "key";
    const rename = vi.fn<(event: KeyboardEvent | MouseEvent) => void>();
    const items: Item[] = [
      { icon: "i-mdi:pencil", onClick: rename, title: "Rename" },
      {
        color: "error",
        icon: "i-mdi:delete",
        isGroupStart: true,
        onClick: vi.fn<(event: KeyboardEvent | MouseEvent) => void>(),
        title: "Delete",
      },
    ];
    const mountTarget = async () => {
      const component = await mountSuspended(
        defineComponent({
          setup: () => {
            const { getContextMenuProps } = useContextMenu();
            return () => [
              h("button", { ...getContextMenuProps(key, () => items), type: "button" }, "target"),
              h(UiContextMenuHost),
            ];
          },
        }),
        { attachTo: document.body },
      );
      const target = component.get("button");
      return { component, target };
    };

    // The mounted app keeps Nuxt's own store, so a menu one test opened is still open for the next
    afterEach(() => {
      const contextMenuStore = useContextMenuStore();
      const { closeContextMenu } = contextMenuStore;
      closeContextMenu();
      vi.useRealTimers();
      document.body.innerHTML = "";
    });

    test("opens at the pointer on a right-click, onto its first item", async () => {
      expect.hasAssertions();

      const { component, target } = await mountTarget();
      const event = rightClick(target.element, { clientX: 1, clientY: 2 });
      await flushPromises();
      const contextMenuStore = useContextMenuStore();
      const { contextMenu } = storeToRefs(contextMenuStore);

      expect(event.defaultPrevented).toBe(true);
      expect(contextMenu.value).toStrictEqual({ items, key, opener: target.element, x: 1, y: 2 });
      expect(component.findAll('[role="menuitem"]').map((menuItem) => menuItem.text())).toStrictEqual([
        "Rename",
        "Delete",
      ]);
      expect(component.findAll('[role="separator"]')).toHaveLength(1);
      expect(document.activeElement?.textContent.trim()).toBe("Rename");
    });

    test("leaves a right-click with Shift held to the browser", async () => {
      expect.hasAssertions();

      const { target } = await mountTarget();
      const event = rightClick(target.element, { shiftKey: true });
      await flushPromises();
      const contextMenuStore = useContextMenuStore();
      const { contextMenu } = storeToRefs(contextMenuStore);

      expect(event.defaultPrevented).toBe(false);
      expect(contextMenu.value).toBeUndefined();
    });

    test("opens at the element's corner on Shift+F10", async () => {
      expect.hasAssertions();

      const { target } = await mountTarget();
      await target.trigger("keydown", { key: "F10", shiftKey: true });
      const { bottom, left } = target.element.getBoundingClientRect();
      const contextMenuStore = useContextMenuStore();
      const { contextMenu } = storeToRefs(contextMenuStore);

      expect(contextMenu.value).toStrictEqual({ items, key, opener: target.element, x: left, y: bottom });
    });

    test("opens under a resting finger, and not under one that moves on to scroll", async () => {
      expect.hasAssertions();

      vi.useFakeTimers();
      const { target } = await mountTarget();
      const contextMenuStore = useContextMenuStore();
      const { contextMenu } = storeToRefs(contextMenuStore);
      const press = (clientX: number) =>
        target.element.dispatchEvent(new PointerEvent("pointerdown", { clientX, clientY: 0, pointerType: "touch" }));
      press(0);
      target.element.dispatchEvent(
        new PointerEvent("pointermove", { clientX: LONG_PRESS_MOVE_TOLERANCE + 1, clientY: 0, pointerType: "touch" }),
      );
      vi.advanceTimersByTime(LONG_PRESS_MS);

      expect(contextMenu.value).toBeUndefined();

      press(1);
      vi.advanceTimersByTime(LONG_PRESS_MS);

      expect(contextMenu.value).toStrictEqual({ items, key, opener: target.element, x: 1, y: 0 });
    });

    test("swallows the one click the lifting finger raises after a long press, and no click after it", async () => {
      expect.hasAssertions();

      vi.useFakeTimers();
      const { target } = await mountTarget();
      const onClick = vi.fn<(event: MouseEvent) => void>();
      target.element.addEventListener("click", onClick);
      target.element.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0, clientY: 0, pointerType: "touch" }));
      vi.advanceTimersByTime(LONG_PRESS_MS);
      target.element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

      expect(onClick).not.toHaveBeenCalled();

      target.element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("swallows no mouse click after a long press the browser raised no click for", async () => {
      expect.hasAssertions();

      vi.useFakeTimers();
      const { target } = await mountTarget();
      const onClick = vi.fn<(event: MouseEvent) => void>();
      target.element.addEventListener("click", onClick);
      target.element.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0, clientY: 0, pointerType: "touch" }));
      vi.advanceTimersByTime(LONG_PRESS_MS);
      target.element.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0, clientY: 0, pointerType: "mouse" }));
      target.element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    // A component that counts any click listener as clickable, a capture one included, would
    // Otherwise turn every target into a link
    test("binds no click listener on the element", () => {
      expect.hasAssertions();

      const { getContextMenuProps } = useContextMenu();

      expect(
        Object.keys(getContextMenuProps(key, () => items)).filter((name) => name.startsWith("onClick")),
      ).toStrictEqual([]);
    });

    test("runs the picked item, then closes with focus back on the element it opened over", async () => {
      expect.hasAssertions();

      const { component, target } = await mountTarget();
      rightClick(target.element);
      await flushPromises();
      await component.get('[role="menu"]').trigger("keydown", { key: "Enter" });
      await flushPromises();
      const contextMenuStore = useContextMenuStore();
      const { contextMenu } = storeToRefs(contextMenuStore);

      expect(rename).toHaveBeenCalledTimes(1);
      expect(contextMenu.value).toBeUndefined();
      expect(document.activeElement).toBe(target.element);
    });

    test("closes on Escape with focus back on the element it opened over", async () => {
      expect.hasAssertions();

      const { component, target } = await mountTarget();
      rightClick(target.element);
      await flushPromises();
      await component.get('[role="menu"]').trigger("keydown", { key: "Escape" });
      await flushPromises();
      const contextMenuStore = useContextMenuStore();
      const { contextMenu } = storeToRefs(contextMenuStore);

      expect(rename).not.toHaveBeenCalled();
      expect(contextMenu.value).toBeUndefined();
      expect(document.activeElement).toBe(target.element);
    });
  });
});
