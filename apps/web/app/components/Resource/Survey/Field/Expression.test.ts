// @vitest-environment happy-dom
import type { SurveyExpressionNode } from "vue-survey-engine-headless";

import ResourceSurveyFieldExpression from "@/components/Resource/Survey/Field/Expression.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import {
  SurveyExpressionDisplayFormat,
  surveyExpressionNodePropsSchema,
  SurveyNodeType,
} from "vue-survey-engine-headless";

describe("resourceSurveyFieldExpression", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const title = "label";
    const createNode = (
      displayFormat: SurveyExpressionDisplayFormat,
      maxFractionDigits: number,
    ): SurveyExpressionNode => ({
      props: {
        ...surveyExpressionNodePropsSchema.parse({ displayFormat, maxFractionDigits, name: "a", title }),
        id: v7(),
      },
      type: SurveyNodeType.Expression,
    });

    test("is named by its title and shows its value rounded to the places its format keeps", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldExpression, {
        props: {
          error: "",
          isDisabled: true,
          modelValue: 1.5,
          node: createNode(SurveyExpressionDisplayFormat.Decimal, 0),
        },
      });
      const output = component.get("output");

      expect(output.attributes("aria-label")).toBe(title);
      expect(output.text()).toBe("2");
    });

    test("shows its value as it is while no format is chosen", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldExpression, {
        props: {
          error: "",
          isDisabled: true,
          modelValue: 0.1,
          node: createNode(SurveyExpressionDisplayFormat.None, 2),
        },
      });

      expect(component.get("output").text()).toBe("0.1");
    });

    test("shows nothing while it holds no value", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldExpression, {
        props: {
          error: "",
          isDisabled: true,
          modelValue: undefined,
          node: createNode(SurveyExpressionDisplayFormat.None, 2),
        },
      });

      expect(component.get("output").text()).toBe("");
    });
  });
});
