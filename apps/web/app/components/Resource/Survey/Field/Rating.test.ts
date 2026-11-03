// @vitest-environment happy-dom
import type { SurveyAnswerValue, SurveyRatingNode } from "survey-engine";

import ResourceSurveyFieldRating from "@/components/Resource/Survey/Field/Rating.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { surveyRatingNodePropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldRating", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const rateCount = 3;
    const title = "Favourite colour";
    const node: SurveyRatingNode = {
      props: { ...surveyRatingNodePropsSchema.parse({ name: "question", rateCount, title }), id: crypto.randomUUID() },
      type: SurveyNodeType.Rating,
    };

    test("is a named radio group of as many steps as its scale counts", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldRating, {
        props: { error: "", isDisabled: false, modelValue: undefined, node },
      });
      await flushPromises();

      expect(component.get('[role="radiogroup"]').attributes("aria-label")).toBe(title);
      expect(component.findAll('[role="radio"]')).toHaveLength(rateCount);
    });

    test("moves its step by the arrow keys", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldRating, {
        attachTo: document.body,
        props: {
          error: "",
          isDisabled: false,
          modelValue: 1,
          node,
          "onUpdate:modelValue": (modelValue: SurveyAnswerValue | undefined) => component.setProps({ modelValue }),
        },
      });
      await flushPromises();
      await component.get('[role="radio"]').trigger("keydown", { key: "ArrowRight" });
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[2]]);
    });

    test("shows its error beside the scale and marks the group invalid", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldRating, {
        props: { error, isDisabled: false, modelValue: undefined, node },
      });
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="radiogroup"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
