// @vitest-environment nuxt
import type { SurveyAnswerValue, SurveyPanelDynamicNode } from "vue-survey-engine-headless";

import ResourceSurveyFieldPanelDynamic from "@/components/Resource/Survey/Field/PanelDynamic.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import {
  surveyCheckboxNodePropsSchema,
  SurveyNodeType,
  surveyPanelDynamicNodePropsSchema,
  surveyTextNodePropsSchema,
} from "vue-survey-engine-headless";
import { assert, beforeAll, describe, expect, test } from "vitest";

const mountPanelDynamic = async (node: SurveyPanelDynamicNode, error = "") => {
  const component = await mountSuspended(ResourceSurveyFieldPanelDynamic, {
    props: {
      error,
      isDisabled: false,
      node,
      "onUpdate:modelValue": (answer?: SurveyAnswerValue) => component.setProps({ modelValue: answer }),
      seed: crypto.randomUUID(),
    },
  });
  await flushPromises();
  return component;
};

const findAddButton = (component: Awaited<ReturnType<typeof mountPanelDynamic>>) => {
  const button = component.findAll("button").find((item) => item.text() === "Add panel");
  assert.exists(button);

  return button;
};

describe("resourceSurveyFieldPanelDynamic", () => {
  // A row's field loads on demand through a dynamic import, which is module I/O rather than a microtask, so the text and
  // Checkbox fields' modules are awaited once up front and each mount resolves them within its flush
  beforeAll(async () => {
    await import("@/components/Resource/Survey/Field/Text.vue");
    await import("@/components/Resource/Survey/Field/Checkbox.vue");
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const message = "message";
    const createNode = (
      panelCount: number,
      minPanelCount: number,
      maxPanelCount: number,
      isRequired = false,
    ): SurveyPanelDynamicNode => ({
      props: {
        ...surveyPanelDynamicNodePropsSchema.parse({
          isRequired,
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

    test("is a group named by its title", async () => {
      expect.hasAssertions();

      const component = await mountPanelDynamic(createNode(1, 0, 2));
      const labelledBy = component.get('[role="group"]').attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(label);
    });

    test("names a required panel with the word required, since a group takes no aria-required", async () => {
      expect.hasAssertions();

      const component = await mountPanelDynamic(createNode(1, 0, 2, true));
      const labelledBy = component.get('[role="group"]').attributes("aria-labelledby");

      expect(component.get('[role="group"]').attributes("aria-required")).toBeUndefined();
      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(`${label} * required`);
    });

    test("draws a required question of a panel's row as required, which its own field says", async () => {
      expect.hasAssertions();

      const node = createNode(1, 0, 2);
      const component = await mountPanelDynamic({
        ...node,
        props: {
          ...node.props,
          template: [
            {
              props: {
                ...surveyTextNodePropsSchema.parse({ isRequired: true, name: "b", title: "question" }),
                id: crypto.randomUUID(),
              },
              type: SurveyNodeType.Text,
            },
          ],
        },
      });

      expect(component.get("input").attributes("aria-required")).toBe("true");
    });

    test("keeps a panel's picks with its row when a panel before it is removed", async () => {
      expect.hasAssertions();

      const node = createNode(2, 0, 3);
      const component = await mountPanelDynamic({
        ...node,
        props: {
          ...node.props,
          template: [
            {
              props: {
                ...surveyCheckboxNodePropsSchema.parse({
                  choices: [
                    { text: "a", value: "a" },
                    { text: "b", value: "b" },
                  ],
                  name: "q",
                  title: "question",
                }),
                id: crypto.randomUUID(),
              },
              type: SurveyNodeType.Checkbox,
            },
          ],
        },
      });
      await component.findAll('[role="checkbox"]')[0]?.trigger("click");
      await flushPromises();
      await component.findAll('[role="checkbox"]')[3]?.trigger("click");
      await flushPromises();
      await component.findAll('[aria-label="Remove panel"]')[0]?.trigger("click");
      await flushPromises();

      expect(
        component.findAll('[role="checkbox"]').map((checkbox) => checkbox.attributes("aria-checked")),
      ).toStrictEqual(["false", "true"]);
    });

    test("adds and removes panels only within its bounds", async () => {
      expect.hasAssertions();

      const component = await mountPanelDynamic(createNode(1, 1, 2));

      expect(component.get('[aria-label="Remove panel"]').attributes("disabled")).toBe("");
      expect(findAddButton(component).attributes("disabled")).toBeUndefined();

      await findAddButton(component).trigger("click");
      await flushPromises();

      expect(component.findAll('[aria-label="Remove panel"]')).toHaveLength(2);
      expect(component.findAll('[aria-label="Remove panel"]')[0]?.attributes("disabled")).toBeUndefined();
      expect(findAddButton(component).attributes("disabled")).toBe("");
    });

    test("shows its error beside the group, which is described by it, and marks no group invalid", async () => {
      expect.hasAssertions();

      const component = await mountPanelDynamic(createNode(1, 0, 2), message);
      const alert = component.get('[role="alert"]');

      expect(alert.text()).toBe(message);
      expect(component.get('[role="group"]').attributes("aria-describedby")).toBe(alert.attributes("id"));
      expect(component.get('[role="group"]').attributes("aria-invalid")).toBeUndefined();
    });
  });
});
