// @vitest-environment nuxt
import type { UiTreeItem } from "@/models/ui/UiTreeItem";

import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiTree from "@/components/Ui/Tree/Index.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

const getFocusedId = () => document.activeElement?.getAttribute("data-item-id");
const press = async (key: string) => {
  assert.exists(document.activeElement);
  document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
  await flushPromises();
  return getFocusedId();
};

describe("uiTree", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const items: UiTreeItem[] = [
      {
        children: [
          { children: [], id: "b", title: "b" },
          { children: [], id: "c", title: "c" },
        ],
        id: "a",
        title: "a",
      },
      { children: [], id: "ba", title: "ba" },
    ];

    test("arrow down moves focus to the next item and selects it", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiTree, {
        attachTo: document.body,
        props: {
          items,
          label,
          modelValue: "",
          "onUpdate:modelValue": (modelValue: string) => component.setProps({ modelValue }),
        },
      });
      component.get('[data-item-id="a"]').element.focus();

      await expect(press("ArrowDown")).resolves.toBe("b");
      expect(component.props("modelValue")).toBe("b");

      component.unmount();
    });

    test("typing the start of a title moves focus to that item", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiTree, {
        attachTo: document.body,
        props: { items, label, modelValue: "" },
      });
      component.get('[data-item-id="a"]').element.focus();

      await expect(press("b")).resolves.toBe("b");

      component.unmount();
    });
  });
});
