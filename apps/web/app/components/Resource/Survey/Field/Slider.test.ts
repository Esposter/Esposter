// @vitest-environment happy-dom
import type { SurveySliderNode } from "vue-survey-engine-headless";

import SurveyFieldSlider from "@/components/Resource/Survey/Field/Slider.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import { SurveyNodeType, surveySliderNodePropsSchema } from "vue-survey-engine-headless";

describe("resourceSurveyFieldSlider", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const title = "title";
    const createNode = (isRequired: boolean): SurveySliderNode => ({
      props: { ...surveySliderNodePropsSchema.parse({ isRequired, name: "a", title }), id: v7() },
      type: SurveyNodeType.Slider,
    });

    test("marks a required question's label with the required mark, and none on an optional one", () => {
      expect.hasAssertions();

      const required = mount(SurveyFieldSlider, { props: { error: "", isDisabled: false, node: createNode(true) } });
      const optional = mount(SurveyFieldSlider, { props: { error: "", isDisabled: false, node: createNode(false) } });

      expect(required.text()).toContain(`${title} * required`);
      expect(optional.text()).not.toContain("required");
    });
  });
});
