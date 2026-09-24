// @vitest-environment happy-dom
import UiRadioGroup from "@/components/Ui/RadioGroup.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiRadioGroup", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const description = "description";
    const label = "label";
    const items = [
      { description, title: "a", value: "a" },
      { title: "b", value: "b" },
    ];
    const mountRadioGroup = (modelValue?: string, isDisabled?: boolean) => {
      const component = mount(UiRadioGroup<string>, {
        attachTo: document.body,
        props: {
          isDisabled,
          items,
          label,
          modelValue,
          "onUpdate:modelValue": (value?: string) => component.setProps({ modelValue: value }),
        },
      });
      return component;
    };

    test("is a named radio group with only its choice in the tab order", async () => {
      expect.hasAssertions();

      const component = mountRadioGroup("b");
      await flushPromises();
      const [first, second] = component.findAll('[role="radio"]');

      expect(component.get('[role="radiogroup"]').attributes("aria-label")).toBe(label);
      expect(first?.attributes("aria-checked")).toBe("false");
      expect(first?.attributes("tabindex")).toBe("-1");
      expect(second?.attributes("aria-checked")).toBe("true");
      expect(second?.attributes("tabindex")).toBe("0");

      component.unmount();
    });

    test("names each option by its title and describes it by its description", async () => {
      expect.hasAssertions();

      const component = mountRadioGroup();
      await flushPromises();
      const [first, second] = component.findAll('[role="radio"]');

      expect(first?.attributes("aria-label")).toBe("a");
      expect(component.get(`#${first?.attributes("aria-describedby")}`).text()).toBe(description);
      expect(second?.attributes("aria-describedby")).toBeUndefined();

      component.unmount();
    });

    test("puts its first option in the tab order while nothing is chosen", async () => {
      expect.hasAssertions();

      const component = mountRadioGroup();
      await flushPromises();
      const [first, second] = component.findAll('[role="radio"]');

      expect(first?.attributes("tabindex")).toBe("0");
      expect(second?.attributes("tabindex")).toBe("-1");

      component.unmount();
    });

    test("chooses by click, and moves the choice by the arrows, wrapping at the ends", async () => {
      expect.hasAssertions();

      const component = mountRadioGroup();
      await flushPromises();
      const [first, second] = component.findAll('[role="radio"]');
      await first?.trigger("click");

      expect(component.props("modelValue")).toBe("a");

      await first?.trigger("keydown", { key: "ArrowUp" });
      await flushPromises();

      expect(component.props("modelValue")).toBe("b");
      expect(second?.attributes("aria-checked")).toBe("true");

      await second?.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();

      expect(component.props("modelValue")).toBe("a");

      component.unmount();
    });

    test("takes no choice while disabled", async () => {
      expect.hasAssertions();

      const component = mountRadioGroup("a", true);
      await flushPromises();
      const second = component.findAll('[role="radio"]')[1];
      await second?.trigger("click");

      expect(second?.attributes("aria-disabled")).toBe("true");
      expect(component.props("modelValue")).toBe("a");

      component.unmount();
    });
  });
});
