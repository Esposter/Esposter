// @vitest-environment happy-dom
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import UiSelect from "@/components/Ui/Select/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiSelect", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const items: UiSelectItem<string>[] = [
      { icon: "", title: "Default", value: "default" },
      { icon: "", title: "Plan", value: "plan" },
      { icon: "", title: "Accept edits", value: "acceptEdits" },
      { icon: "", title: "Auto", value: "auto" },
    ];
    const label = "label";
    const mountSelect = async () => {
      const component = mount(UiSelect, { attachTo: document.body, props: { items, label, modelValue: "plan" } });
      const activator = component.get('[role="combobox"]');
      await activator.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      const press = async (key: string) => {
        await activator.trigger("keydown", { key });
        await flushPromises();
        const highlightedId = activator.attributes("aria-activedescendant");
        return highlightedId ? document.getElementById(highlightedId)?.textContent.trim() : undefined;
      };
      return { activator, component, press };
    };

    test("shows the selected title on a trigger named by its label", () => {
      expect.hasAssertions();

      const component = mount(UiSelect, { props: { items, label, modelValue: "plan" } });
      const activator = component.get('[role="combobox"]');

      expect(activator.text()).toBe("Plan");
      expect(activator.attributes("aria-label")).toBe(label);
      expect(activator.attributes("aria-haspopup")).toBe("listbox");
    });

    test("opens onto the selected option, walks by arrow, Home and End, and jumps by a title's first letters", async () => {
      expect.hasAssertions();

      const { activator, press } = await mountSelect();

      expect(activator.attributes("aria-expanded")).toBe("true");
      await expect(press("ArrowDown")).resolves.toBe("Accept edits");
      await expect(press("End")).resolves.toBe("Auto");
      await expect(press("Home")).resolves.toBe("Default");
      await expect(press("a")).resolves.toBe("Accept edits");
      await expect(press("a")).resolves.toBe("Auto");
    });

    test("selects the highlighted option on Enter and marks it selected", async () => {
      expect.hasAssertions();

      const { activator, component, press } = await mountSelect();
      await press("End");
      await press("Enter");

      expect(component.emitted("update:modelValue")).toStrictEqual([["auto"]]);
      expect(activator.attributes("aria-expanded")).toBe("false");
      expect(component.get('[aria-selected="true"]').text()).toBe("Auto");
    });

    test.each([
      [[], label],
      [["plan"], "Plan"],
      [["plan", "auto"], "Plan, Auto"],
      [["default", "plan", "acceptEdits", "auto"], "4 selected"],
    ])("holding %j, shows the chosen titles on its trigger, or how many past a few", (modelValue, title) => {
      expect.hasAssertions();

      const component = mount(UiSelect, { props: { items, label, modelValue } });

      expect(component.get('[role="combobox"]').text()).toBe(title);
    });

    test("bound to several choices, is a multiselectable listbox that toggles its options and stays open", async () => {
      expect.hasAssertions();

      const component = mount(UiSelect, {
        attachTo: document.body,
        props: {
          items,
          label,
          modelValue: ["plan"],
          "onUpdate:modelValue": (modelValue: string | string[]) => component.setProps({ modelValue }),
        },
      });
      const activator = component.get('[role="combobox"]');
      const press = async (key: string) => {
        await activator.trigger("keydown", { key });
        await flushPromises();
      };
      await press("ArrowDown");
      await press("End");
      await press("Enter");
      await press("Home");
      await press("ArrowDown");
      await press("Enter");

      expect(component.get('[role="listbox"]').attributes("aria-multiselectable")).toBe("true");
      expect(component.emitted<[string[]]>("update:modelValue")?.map(([modelValue]) => modelValue)).toStrictEqual([
        ["plan", "auto"],
        ["auto"],
      ]);
      expect(activator.attributes("aria-expanded")).toBe("true");
      expect(component.findAll('[aria-selected="true"]').map((option) => option.text())).toStrictEqual(["Auto"]);
    });
  });
});
