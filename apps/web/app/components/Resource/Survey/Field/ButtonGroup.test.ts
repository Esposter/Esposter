// @vitest-environment happy-dom
import type { SurveyAnswerValue, SurveyButtonGroupNode } from "vue-survey-engine-headless";

import ResourceSurveyFieldButtonGroup from "@/components/Resource/Survey/Field/ButtonGroup.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { surveyButtonGroupNodePropsSchema, SurveyNodeType } from "vue-survey-engine-headless";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldButtonGroup", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const choices = [
      { text: "", value: 1 },
      { text: "", value: 2 },
    ];
    const error = "error";
    const title = "Favourite colour";
    const node: SurveyButtonGroupNode = {
      props: {
        ...surveyButtonGroupNodePropsSchema.parse({ choices, name: "question", title }),
        id: crypto.randomUUID(),
      },
      type: SurveyNodeType.ButtonGroup,
    };

    test("is a named radio group that holds the chosen value", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldButtonGroup, {
        props: { error: "", isDisabled: false, modelValue: 2, node },
      });
      await flushPromises();
      const [, second] = component.findAll('[role="radio"]');

      expect(component.get('[role="radiogroup"]').attributes("aria-label")).toBe(title);
      expect(second?.attributes("aria-checked")).toBe("true");
    });

    test("moves its choice by the arrow keys", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldButtonGroup, {
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

    test("shows its error beside the group and marks the group invalid", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldButtonGroup, {
        props: { error, isDisabled: false, modelValue: undefined, node },
      });
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="radiogroup"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
