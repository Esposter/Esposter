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
  });
});
