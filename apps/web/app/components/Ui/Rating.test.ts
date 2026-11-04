// @vitest-environment happy-dom
import UiRating from "@/components/Ui/Rating.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiRating", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const count = 5;
    const label = "label";
    const mountRating = (props: { isDisabled?: boolean; modelValue: number | string }) => {
      const component = mount(UiRating, {
        attachTo: document.body,
        props: {
          count,
          label,
          ...props,
          "onUpdate:modelValue": (modelValue: number) => component.setProps({ modelValue }),
        },
        slots: { mark: ({ isOn, value }) => h("i", { "data-filled": String(isOn), "data-value": value }) },
      });
      return component;
    };
    const getFilled = (component: ReturnType<typeof mountRating>) =>
      component.findAll("i").map((mark) => mark.attributes("data-filled") === "true");

    test("is a named radio group with a step for each count, each named by its number", async () => {
      expect.hasAssertions();

      const component = mountRating({ modelValue: "" });
      await flushPromises();
      const steps = component.findAll('[role="radio"]');

      expect(component.get('[role="radiogroup"]').attributes("aria-label")).toBe(label);
      expect(steps).toHaveLength(count);
      expect(steps[0]?.attributes("aria-label")).toBe("1");
    });

    test("fills the steps up to the one under the pointer until the pointer leaves", async () => {
      expect.hasAssertions();

      const component = mountRating({ modelValue: 2 });
      await flushPromises();
      await component.findAll('[role="radio"]')[3]?.trigger("pointerenter");
      const previewed = getFilled(component);
      await component.get('[role="radiogroup"]').trigger("pointerleave");

      expect(previewed).toStrictEqual([true, true, true, true, false]);
      expect(getFilled(component)).toStrictEqual([true, true, false, false, false]);
    });

    test("chooses a step by a click and moves the choice by the arrows", async () => {
      expect.hasAssertions();

      const component = mountRating({ modelValue: 1 });
      await flushPromises();
      await component.findAll('[role="radio"]')[3]?.trigger("click");
      await component.findAll('[role="radio"]')[3]?.trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[4], [5]]);
    });

    test("neither changes its choice nor previews a step while disabled", async () => {
      expect.hasAssertions();

      const component = mountRating({ isDisabled: true, modelValue: 2 });
      await flushPromises();
      await component.findAll('[role="radio"]')[3]?.trigger("click");
      await component.findAll('[role="radio"]')[3]?.trigger("pointerenter");

      expect(component.emitted("update:modelValue")).toBeUndefined();
      expect(getFilled(component)).toStrictEqual([true, true, false, false, false]);
    });

    test("puts what a call site passes on the group's own element", async () => {
      expect.hasAssertions();

      const attribute = "aria-invalid";
      const component = mount(UiRating, {
        attrs: { [attribute]: "true" },
        props: { count, label, modelValue: "" },
        slots: { mark: () => h("i") },
      });
      await flushPromises();

      expect(component.get('[role="radiogroup"]').attributes(attribute)).toBe("true");
    });
  });
});
