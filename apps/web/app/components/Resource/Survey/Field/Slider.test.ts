// @vitest-environment happy-dom
import type { SurveySliderNode } from "survey-engine";

import ResourceSurveyFieldSlider from "@/components/Resource/Survey/Field/Slider.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { surveySliderNodePropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldSlider", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const title = "Favourite colour";
    const node: SurveySliderNode = {
      props: { ...surveySliderNodePropsSchema.parse({ name: "question", title }), id: crypto.randomUUID() },
      type: SurveyNodeType.Slider,
    };

    test("is a named slider that says the value the answer holds", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldSlider, {
        props: { error: "", isDisabled: false, modelValue: 3, node },
      });
      const slider = component.get('[role="slider"]');

      expect(slider.attributes("aria-label")).toBe(title);
      expect(slider.attributes("aria-valuenow")).toBe("3");
    });

    test("moves its value by the arrow keys from the minimum while no answer is held", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldSlider, {
        attachTo: document.body,
        props: { error: "", isDisabled: false, modelValue: undefined, node },
      });
      await component.get('[role="slider"]').trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[1]]);
    });

    test("draws no value beside its track when it does not show its value", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldSlider, {
        props: {
          error: "",
          isDisabled: false,
          modelValue: 3,
          node: { ...node, props: { ...node.props, showValue: false } },
        },
      });

      expect(component.text()).toBe(title);
    });

    test("shows its error beside the track", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldSlider, { props: { error, isDisabled: false, modelValue: 3, node } });

      expect(component.get('[role="alert"]').text()).toBe(error);
    });
  });
});
