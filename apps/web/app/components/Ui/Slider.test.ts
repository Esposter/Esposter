// @vitest-environment happy-dom
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiSlider from "@/components/Ui/Slider.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiSlider", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const valueText = "valueText";
    const mountSlider = () => {
      const component = mount(UiSlider, {
        attachTo: document.body,
        props: {
          label,
          max: 100,
          min: 0,
          modelValue: 0,
          "onUpdate:modelValue": (modelValue: number) => component.setProps({ modelValue }),
          step: 1,
          valueText,
        },
      });
      return component;
    };

    test("is a named slider that says its range, its value and its reading", () => {
      expect.hasAssertions();

      const component = mountSlider();
      const slider = component.get('[role="slider"]');

      expect(slider.attributes("aria-label")).toBe(label);
      expect(slider.attributes("aria-valuemin")).toBe("0");
      expect(slider.attributes("aria-valuemax")).toBe("100");
      expect(slider.attributes("aria-valuenow")).toBe("0");
      expect(slider.attributes("aria-valuetext")).toBe(valueText);
      expect(slider.attributes("tabindex")).toBe("0");
    });

    test("steps by the arrows, further by the page keys and to its ends by Home and End, settling each", async () => {
      expect.hasAssertions();

      const component = mountSlider();
      const slider = component.get('[role="slider"]');
      await slider.trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(component.props("modelValue")).toBe(1);

      await slider.trigger("keydown", { key: "PageUp" });
      await flushPromises();

      expect(component.props("modelValue")).toBe(11);

      await slider.trigger("keydown", { key: "ArrowLeft" });
      await flushPromises();

      expect(component.props("modelValue")).toBe(10);

      await slider.trigger("keydown", { key: "End" });
      await flushPromises();

      expect(component.props("modelValue")).toBe(100);
      expect(slider.attributes("aria-valuenow")).toBe("100");

      await slider.trigger("keydown", { key: "Home" });
      await flushPromises();

      expect(component.props("modelValue")).toBe(0);
      expect(component.emitted<[number]>("end")).toStrictEqual([[1], [11], [10], [100], [0]]);
    });

    test("settles once a drag lets go", async () => {
      expect.hasAssertions();

      const component = mountSlider();
      await component.get('[role="slider"]').trigger("pointerdown", { button: 0 });

      expect(component.emitted("end")).toBeUndefined();

      document.dispatchEvent(new PointerEvent("pointerup"));
      await flushPromises();

      expect(component.emitted<[number]>("end")).toStrictEqual([[0]]);
    });

    test("settles a key's change after a press in the band around the track, which never becomes a drag", async () => {
      expect.hasAssertions();

      const component = mountSlider();
      await component.get(".slider").trigger("pointerdown", { button: 0 });
      document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      await flushPromises();
      await component.get('[role="slider"]').trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(component.emitted<[number]>("end")).toStrictEqual([[1]]);
    });

    test("takes no key while disabled, and is drawn faded", async () => {
      expect.hasAssertions();

      const component = mount(UiSlider, {
        props: { isDisabled: true, label, max: 10, min: 0, modelValue: 5, step: 1, valueText: "5" },
      });
      await flushPromises();
      await component.get('[role="slider"]').trigger("keydown", { key: "ArrowRight" });

      expect(component.emitted("update:modelValue")).toBeUndefined();
      expect(component.get('[role="group"]').classes()).toContain("op-disabled");
    });

    test("marks its thumb invalid and tints its track, leaving the group unmarked", () => {
      expect.hasAssertions();

      const component = mount(UiSlider, {
        props: { isInvalid: true, label, max: 100, min: 0, modelValue: 0, step: 1, valueText },
      });

      expect(component.get('[role="slider"]').attributes("aria-invalid")).toBe("true");
      expect(component.get('[role="group"]').attributes("aria-invalid")).toBeUndefined();
      expect(component.find("[data-invalid]").exists()).toBe(true);
    });

    test("names a required thumb by its label and the required word", () => {
      expect.hasAssertions();

      const component = mount(UiSlider, {
        props: { isRequired: true, label, max: 100, min: 0, modelValue: 0, step: 1, valueText },
      });
      const labelledBy = component.get('[role="slider"]').attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(`${label} * required`);
    });

    test("hides its label but keeps it as its name", () => {
      expect.hasAssertions();

      const component = mount(UiSlider, {
        props: { isLabelHidden: true, label, max: 100, min: 0, modelValue: 0, step: 1, valueText },
      });

      expect(component.get(".sr-only").text()).toBe(label);
      expect(component.get('[role="slider"]').attributes("aria-label")).toBe(label);
    });

    test("names a required thumb with its label hidden by the label and the required word", () => {
      expect.hasAssertions();

      const component = mount(UiSlider, {
        props: { isLabelHidden: true, isRequired: true, label, max: 100, min: 0, modelValue: 0, step: 1, valueText },
      });
      const labelledBy = component.get('[role="slider"]').attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(`${label} * required`);
    });

    test("draws a live level along its track, held to it and named apart from the value", () => {
      expect.hasAssertions();

      const levelLabel = "levelLabel";
      const component = mount(UiSlider, {
        props: { label, level: 2, levelLabel, max: 100, min: 0, modelValue: 0, step: 1, valueText },
      });
      const level = component.get<HTMLElement>(`[aria-label="${levelLabel}"]`);

      expect(level.attributes("role")).toBe("img");
      expect(level.element.style.width).toBe("100%");
    });
  });
});
