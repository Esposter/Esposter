// @vitest-environment happy-dom
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";

import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import UiTabs from "#src/components/Ui/Tabs.vue";
import { UiStyles } from "#src/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiTabs", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const items: UiMenuItem<string>[] = [
      { title: "a", value: "a" },
      { title: "b", value: "b" },
      { title: "c", value: "c" },
    ];
    const label = "label";
    const mountTabs = () =>
      mount(UiTabs, {
        attachTo: document.body,
        props: { items, label, modelValue: "b" },
        slots: { default: ({ value }: { value: string }) => value },
      });

    test("names its list and shows the selected tab's panel alone", () => {
      expect.hasAssertions();

      const component = mountTabs();
      const selectedTab = component.get('[role="tab"][aria-selected="true"]');
      const shownPanels = component
        .findAll('[role="tabpanel"]')
        .filter((panel) => panel.attributes("hidden") === undefined);

      expect(component.get('[role="tablist"]').attributes("aria-label")).toBe(label);
      expect(selectedTab.text()).toBe("b");
      expect(shownPanels.map((panel) => panel.text())).toStrictEqual(["b"]);
      expect(shownPanels.map((panel) => panel.attributes("aria-labelledby"))).toStrictEqual([
        selectedTab.attributes("id"),
      ]);
    });

    test("reads a tab's count after its title, in its name", () => {
      expect.hasAssertions();

      const component = mount(UiTabs, {
        props: { items: [{ count: 0, title: "title", value: "title" }], label, modelValue: "title" },
      });

      expect(component.get('[role="tab"]').text()).toBe("title 0");
    });

    test("walks and selects by arrow, Home and End, with only the selected tab in the tab order", async () => {
      expect.hasAssertions();

      const component = mountTabs();
      const press = async (key: string) => {
        await component.get('[role="tab"][aria-selected="true"]').trigger("keydown", { key });
        await flushPromises();
      };

      expect(component.findAll('[role="tab"]').map((tab) => tab.attributes("tabindex"))).toStrictEqual([
        "-1",
        "0",
        "-1",
      ]);
      await press("ArrowRight");
      await component.setProps({ modelValue: "c" });
      await press("Home");
      await component.setProps({ modelValue: "a" });
      await press("End");
      await component.setProps({ modelValue: "c" });
      await press("ArrowLeft");

      expect(component.emitted<[string]>("update:modelValue")).toStrictEqual([["c"], ["a"], ["c"], ["b"]]);
    });
  });
});
