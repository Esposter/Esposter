// @vitest-environment happy-dom
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiTabs from "@/components/Ui/Tabs.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiTabs", () => {
  enableAutoUnmount(afterEach);

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const items: UiMenuItem<string>[] = [
      { title: "Gallery", value: "gallery" },
      { title: "Leaderboard", value: "leaderboard" },
      { title: "Stats", value: "stats" },
    ];
    const label = "label";
    const mountTabs = () =>
      mount(UiTabs, {
        attachTo: document.body,
        props: { items, label, modelValue: "leaderboard" },
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
      expect(selectedTab.text()).toBe("Leaderboard");
      expect(shownPanels.map((panel) => panel.text())).toStrictEqual(["leaderboard"]);
      expect(shownPanels[0]?.attributes("aria-labelledby")).toBe(selectedTab.attributes("id"));
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
        return component.emitted<[string]>("update:modelValue")?.at(-1)?.[0];
      };

      expect(component.findAll('[role="tab"]').map((tab) => tab.attributes("tabindex"))).toStrictEqual([
        "-1",
        "0",
        "-1",
      ]);
      await expect(press("ArrowRight")).resolves.toBe("stats");
      await component.setProps({ modelValue: "stats" });
      await expect(press("Home")).resolves.toBe("gallery");
      await component.setProps({ modelValue: "gallery" });
      await expect(press("End")).resolves.toBe("stats");
      await component.setProps({ modelValue: "stats" });
      await expect(press("ArrowLeft")).resolves.toBe("leaderboard");
    });
  });
});
