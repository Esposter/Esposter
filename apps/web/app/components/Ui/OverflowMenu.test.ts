// @vitest-environment happy-dom
import type { Item } from "@/models/shared/Item";

import UiOverflowMenu from "@/components/Ui/OverflowMenu.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("uiOverflowMenu", () => {
  const label = "label";

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("runs the item picked by the keyboard, and draws a destructive one in the error colour", async () => {
    expect.hasAssertions();

    const rename = vi.fn<(event: KeyboardEvent | MouseEvent) => void>();
    const items: Item[] = [
      { icon: "i-mdi:pencil", onClick: rename, title: "Rename" },
      { color: "error", icon: "i-mdi:delete", title: "Delete" },
    ];
    const component = mount(UiOverflowMenu, { attachTo: document.body, props: { items, label } });
    const trigger = component.get("button");

    expect(trigger.attributes("aria-label")).toBe(label);

    await trigger.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const menu = component.get('[role="menu"]');

    expect(menu.findAll('[role="menuitem"]').map((item) => item.classes("text-error"))).toStrictEqual([false, true]);

    await menu.trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(rename).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger.element);
  });
});
