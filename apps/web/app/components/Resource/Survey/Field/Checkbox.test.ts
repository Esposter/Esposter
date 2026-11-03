// @vitest-environment happy-dom
import type { SurveyCheckboxNode, SurveyCheckboxNodeProps } from "survey-engine";

import ResourceSurveyFieldCheckbox from "@/components/Resource/Survey/Field/Checkbox.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { surveyCheckboxNodePropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldCheckbox", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const choices = [
      { text: "", value: 1 },
      { text: "", value: 2 },
    ];
    const error = "error";
    const otherText = "a";
    const title = "Favourite colour";
    const createNode = (props: Partial<SurveyCheckboxNodeProps>): SurveyCheckboxNode => ({
      props: {
        ...surveyCheckboxNodePropsSchema.parse({ choices, name: "question", title, ...props }),
        id: crypto.randomUUID(),
      },
      type: SurveyNodeType.Checkbox,
    });

    test("is a named group of checkboxes, each saying whether it is checked", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({}) },
      });
      const [first, second] = component.findAll('[role="checkbox"]');

      expect(component.get('[role="group"]').attributes("aria-label")).toBe(title);
      expect(first?.attributes("aria-checked")).toBe("true");
      expect(second?.attributes("aria-checked")).toBe("false");
    });

    test("adds a picked choice to the answer list", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({}) },
      });
      await component.get('[aria-label="2"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, 2]]]);
    });

    test("selects every choice with select all, which is mixed while only some are chosen", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({ hasSelectAll: true }) },
      });

      expect(component.get('[aria-label="Select all"]').attributes("aria-checked")).toBe("mixed");

      await component.get('[aria-label="Select all"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, 2]]]);
    });

    test("holds none on its own, and a picked choice gives none up", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({ hasNone: true }) },
      });
      await component.get('[aria-label="None"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[["none"]]]);

      const noneChosen = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: ["none"], node: createNode({ hasNone: true }) },
      });
      await noneChosen.get('[aria-label="2"]').trigger("click");

      expect(noneChosen.emitted("update:modelValue")).toStrictEqual([[[2]]]);
    });

    test("picks other as an empty entry, and shows its text field only while other is picked", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({ hasOther: true }) },
      });

      expect(component.find("input").exists()).toBe(false);

      await component.get('[aria-label="Other"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, ""]]]);
    });

    test("writes typed text as the other entry of the answer list", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1, ""], node: createNode({ hasOther: true }) },
      });
      await component.get("input").setValue(otherText);
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, otherText]]]);
    });

    test("shows its error beside the group and marks each checkbox invalid", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error, isDisabled: false, modelValue: [], node: createNode({}) },
      });
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="checkbox"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
