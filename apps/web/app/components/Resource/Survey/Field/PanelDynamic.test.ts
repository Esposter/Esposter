// @vitest-environment happy-dom
import type { SurveyAnswerValue, SurveyPanelDynamicNode } from "survey-engine";

import ResourceSurveyFieldPanelDynamic from "@/components/Resource/Survey/Field/PanelDynamic.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { SurveyNodeType, surveyPanelDynamicNodePropsSchema } from "survey-engine";
import { assert, describe, expect, test } from "vitest";

const mountPanelDynamic = (node: SurveyPanelDynamicNode, error = "") => {
  const component = mount(ResourceSurveyFieldPanelDynamic, {
    props: {
      error,
      isDisabled: false,
      node,
      "onUpdate:modelValue": (answer?: SurveyAnswerValue) => component.setProps({ modelValue: answer }),
      seed: crypto.randomUUID(),
    },
  });
  return component;
};

const findAddButton = (component: ReturnType<typeof mountPanelDynamic>) => {
  const button = component.findAll("button").find((item) => item.text() === "Add panel");
  assert.exists(button);

  return button;
};

describe("resourceSurveyFieldPanelDynamic", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const message = "message";
    const createNode = (panelCount: number, minPanelCount: number, maxPanelCount: number): SurveyPanelDynamicNode => ({
      props: {
        ...surveyPanelDynamicNodePropsSchema.parse({
          maxPanelCount,
          minPanelCount,
          name: "a",
          panelCount,
          title: label,
        }),
        id: crypto.randomUUID(),
        template: [],
      },
      type: SurveyNodeType.PanelDynamic,
    });

    test("is a group named by its title", () => {
      expect.hasAssertions();

      const component = mountPanelDynamic(createNode(1, 0, 2));

      expect(component.get('[role="group"]').attributes("aria-label")).toBe(label);
    });

    test("adds and removes panels only within its bounds", async () => {
      expect.hasAssertions();

      const component = mountPanelDynamic(createNode(1, 1, 2));

      expect(component.get('[aria-label="Remove panel"]').attributes("disabled")).toBe("");
      expect(findAddButton(component).attributes("disabled")).toBeUndefined();

      await findAddButton(component).trigger("click");
      await flushPromises();

      expect(component.findAll('[aria-label="Remove panel"]')).toHaveLength(2);
      expect(component.findAll('[aria-label="Remove panel"]')[0]?.attributes("disabled")).toBeUndefined();
      expect(findAddButton(component).attributes("disabled")).toBe("");
    });

    test("shows its error beside the group and marks the group invalid", () => {
      expect.hasAssertions();

      const component = mountPanelDynamic(createNode(1, 0, 2), message);

      expect(component.get('[role="alert"]').text()).toBe(message);
      expect(component.get('[role="group"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
