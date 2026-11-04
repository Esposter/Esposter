// @vitest-environment happy-dom
import type { SurveyBooleanNode } from "headless-survey-engine";

import SurveyFieldBoolean from "@/components/Resource/Survey/Field/Boolean.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { SurveyBooleanDisplayStyle, surveyBooleanNodePropsSchema, SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldBoolean", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "message";
    const title = "title";
    const createNode = (displayStyle?: SurveyBooleanDisplayStyle): SurveyBooleanNode => ({
      props: { ...surveyBooleanNodePropsSchema.parse({ displayStyle, name: "a", title }), id: crypto.randomUUID() },
      type: SurveyNodeType.Boolean,
    });

    test("is a switch named by the question's title that answers true when pressed", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldBoolean, { props: { error: "", isDisabled: false, node: createNode() } });
      const control = component.get('[role="switch"]');
      const labelledBy = control.attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(title);

      await control.trigger("click");
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[true]]);
    });

    test("is a radio group named by the question's title whose two options answer booleans", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldBoolean, {
        props: { error: "", isDisabled: false, node: createNode(SurveyBooleanDisplayStyle.Radio) },
      });
      const [, no] = component.findAll('[role="radio"]');

      expect(component.get('[role="radiogroup"]').attributes("aria-label")).toBe(title);

      await no?.trigger("click");
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
    });

    test("shows its error beside it and marks the switch invalid", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldBoolean, { props: { error, isDisabled: false, node: createNode() } });

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="switch"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
