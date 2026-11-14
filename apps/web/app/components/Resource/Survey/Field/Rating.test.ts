// @vitest-environment happy-dom
import type { SurveyAnswerValue, SurveyRatingNode } from "vue-survey-engine-headless";

import ResourceSurveyFieldRating from "@/components/Resource/Survey/Field/Rating.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyles } from "@/models/ui/UiStyle";
import { SURVEY_SMILEY_MEANINGS } from "@/services/resource/survey/constants";
import { UiIconMap } from "@/services/ui/UiIconMap";
import { flushPromises, mount } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import { SurveyNodeType, surveyRatingNodePropsSchema, SurveyRatingType } from "vue-survey-engine-headless";

describe("resourceSurveyFieldRating", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const rateCount = 3;
    const title = "Favourite colour";
    const createNode = (rateType: SurveyRatingType, count: number): SurveyRatingNode => ({
      props: {
        ...surveyRatingNodePropsSchema.parse({ name: "question", rateCount: count, rateType, title }),
        id: v7(),
      },
      type: SurveyNodeType.Rating,
    });
    const node = createNode(SurveyRatingType.Labels, rateCount);

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

    test("draws a star for each step, the steps up to its answer filled", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldRating, {
        props: { error: "", isDisabled: false, modelValue: 3, node: createNode(SurveyRatingType.Stars, 5) },
      });
      await flushPromises();
      const meanings = [UiIconMeaning.StarFilled, UiIconMeaning.Star];

      expect(
        component
          .findAll('[role="radio"] span')
          .map((mark) => meanings.find((meaning) => mark.element.classList.contains(UiIconMap[uiStyle][meaning]))),
      ).toStrictEqual([
        UiIconMeaning.StarFilled,
        UiIconMeaning.StarFilled,
        UiIconMeaning.StarFilled,
        UiIconMeaning.Star,
        UiIconMeaning.Star,
      ]);
    });

    test("draws one face per step from the angriest at the first to the happiest at the last, the chosen one in the accent", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldRating, {
        props: { error: "", isDisabled: false, modelValue: 4, node: createNode(SurveyRatingType.Smileys, 5) },
      });
      await flushPromises();
      const meanings = SURVEY_SMILEY_MEANINGS;
      const marks = component.findAll('[role="radio"] span');

      expect(
        marks.map((mark) => meanings.find((meaning) => mark.element.classList.contains(UiIconMap[uiStyle][meaning]))),
      ).toStrictEqual(meanings);
      expect(marks.map((mark) => mark.element.classList.contains("text-accent"))).toStrictEqual([
        false,
        false,
        false,
        true,
        false,
      ]);
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
