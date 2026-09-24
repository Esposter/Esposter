import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
// @vitest-environment happy-dom
import UiToggleGroup from "@/components/Ui/ToggleGroup.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiToggleGroup", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const items = [
      { title: "a", value: "a" },
      { title: "b", value: "b" },
    ];
    const mountToggleGroup = () => {
      const component = mount(UiToggleGroup<string>, {
        attachTo: document.body,
        props: {
          items,
          label,
          modelValue: "a",
          "onUpdate:modelValue": (modelValue: string) => component.setProps({ modelValue }),
        },
      });
      return component;
    };

    test("is a named radio group with only its choice in the tab order", async () => {
      expect.hasAssertions();

      const component = mountToggleGroup();
      await flushPromises();
      const [first, second] = component.findAll('[role="radio"]');

      expect(component.get('[role="radiogroup"]').attributes("aria-label")).toBe(label);
      expect(first?.attributes("aria-checked")).toBe("true");
      expect(first?.attributes("tabindex")).toBe("0");
      expect(second?.attributes("aria-checked")).toBe("false");
      expect(second?.attributes("tabindex")).toBe("-1");

      component.unmount();
    });

    test("moves its choice by click and by the arrows", async () => {
      expect.hasAssertions();

      const component = mountToggleGroup();
      await flushPromises();
      const [first, second] = component.findAll('[role="radio"]');
      await second?.trigger("click");

      expect(component.props("modelValue")).toBe("b");

      await second?.trigger("keydown", { key: "ArrowLeft" });
      await flushPromises();

      expect(component.props("modelValue")).toBe("a");
      expect(first?.attributes("aria-checked")).toBe("true");

      component.unmount();
    });

    test("names an icon-only choice by its title, drawn as its mark alone", async () => {
      expect.hasAssertions();

      const icon = "i-mdi:close";
      const component = mount(UiToggleGroup<string>, {
        props: { isIconOnly: true, items: [{ icon, title: "a", value: "a" }], label, modelValue: "a" },
      });
      await flushPromises();
      const choice = component.get('[role="radio"]');

      expect(choice.attributes("aria-label")).toBe("a");
      expect(choice.text()).toBe("");
      expect(choice.find(`[class~="${icon}"]`).exists()).toBe(true);
    });

    test("chooses a number as it does a string", async () => {
      expect.hasAssertions();

      const component = mount(UiToggleGroup<number>, {
        props: { items: [0, 1].map((value) => ({ title: String(value), value })), label, modelValue: 0 },
      });
      await flushPromises();
      await component.findAll('[role="radio"]')[1]?.trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[1]]);
    });
  });
});
