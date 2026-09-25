// @vitest-environment happy-dom
import type { Item } from "@/models/shared/Item";

import UiOverflowMenu from "@/components/Ui/OverflowMenu.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyles } from "@/models/ui/UiStyle";
import { UiIconMap } from "@/services/ui/UiIconMap";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe("uiOverflowMenu", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";

    test("runs the item picked by the keyboard, and draws a destructive one in the error colour", async () => {
      expect.hasAssertions();

      const rename = vi.fn<(event: KeyboardEvent | MouseEvent) => void>();
      const items: Item[] = [
        { icon: "", onClick: rename, title: "Rename" },
        { icon: "", isDanger: true, title: "Delete" },
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

      expect(rename).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(trigger.element);
    });

    test("draws an item's meaning in the style's own glyph", async () => {
      expect.hasAssertions();

      const items: Item[] = [{ meaning: UiIconMeaning.Download, title: "Download" }];
      const component = mount(UiOverflowMenu, { attachTo: document.body, props: { items, label } });
      await component.get("button").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();

      expect(
        component.get('[role="menuitem"]').find(`[class~="${UiIconMap[uiStyle][UiIconMeaning.Download]}"]`).exists(),
      ).toBe(true);
    });
  });
});
