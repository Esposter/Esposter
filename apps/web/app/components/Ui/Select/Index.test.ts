// @vitest-environment happy-dom
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import UiSelect from "@/components/Ui/Select/Index.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiSelect", () => {
  const items: UiMenuItem<string>[] = [
    { title: "Default", value: "default" },
    { title: "Plan", value: "plan" },
    { title: "Accept edits", value: "acceptEdits" },
    { title: "Auto", value: "auto" },
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

  afterEach(() => {
    document.body.innerHTML = "";
  });

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
});
