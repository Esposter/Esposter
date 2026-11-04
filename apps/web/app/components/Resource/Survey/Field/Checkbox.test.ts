// @vitest-environment happy-dom
import type { SurveyCheckboxNode, SurveyCheckboxNodeProps } from "headless-survey-engine";

import ResourceSurveyFieldCheckbox from "@/components/Resource/Survey/Field/Checkbox.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import {
  getSurveyChoiceText,
  getSurveyOrderedChoices,
  surveyCheckboxNodePropsSchema,
  SurveyChoicesOrder,
  SurveyNodeType,
} from "headless-survey-engine";
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
    const seed = crypto.randomUUID();
    const title = "Favourite colour";
    const createNode = (props: Partial<SurveyCheckboxNodeProps>): SurveyCheckboxNode => ({
      props: {
        ...surveyCheckboxNodePropsSchema.parse({ choices, name: "question", title, ...props }),
        id: crypto.randomUUID(),
      },
      type: SurveyNodeType.Checkbox,
    });

    test("names its group by the question's title and the required word, where it is required", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({ isRequired: true }), seed },
      });
      const labelledBy = component.get('[role="group"]').attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(`${title} * required`);
    });

    test("is a group of checkboxes, each saying whether it is checked", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({}), seed },
      });
      const [first, second] = component.findAll('[role="checkbox"]');

      expect(first?.attributes("aria-checked")).toBe("true");
      expect(second?.attributes("aria-checked")).toBe("false");
    });

    test("adds a picked choice to the answer list", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({}), seed },
      });
      await component.get('[aria-label="2"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, 2]]]);
    });

    test("draws a shuffled list in the order its seed draws, so one seed shows one order", () => {
      expect.hasAssertions();

      const shuffledChoices = [
        { text: "a", value: "a" },
        { text: "b", value: "b" },
        { text: "c", value: "c" },
        { text: "d", value: "d" },
      ];
      const component = mount(ResourceSurveyFieldCheckbox, {
        props: {
          error: "",
          isDisabled: false,
          modelValue: [],
          node: createNode({ choices: shuffledChoices, choicesOrder: SurveyChoicesOrder.Random }),
          seed,
        },
      });
      const labels = component.findAll('[role="checkbox"]').map((checkbox) => checkbox.attributes("aria-label"));

      expect(labels).toStrictEqual(
        getSurveyOrderedChoices(shuffledChoices, SurveyChoicesOrder.Random, seed).map((choice) =>
          getSurveyChoiceText(choice),
        ),
      );
    });

    test("selects every choice with select all, which is mixed while only some are chosen", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({ hasSelectAll: true }), seed },
      });

      expect(component.get('[aria-label="Select all"]').attributes("aria-checked")).toBe("mixed");

      await component.get('[aria-label="Select all"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, 2]]]);
    });

    test("holds none on its own, and a picked choice gives none up", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({ hasNone: true }), seed },
      });
      await component.get('[aria-label="None"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[["none"]]]);

      const noneChosen = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: ["none"], node: createNode({ hasNone: true }), seed },
      });
      await noneChosen.get('[aria-label="2"]').trigger("click");

      expect(noneChosen.emitted("update:modelValue")).toStrictEqual([[[2]]]);
    });

    test("picks other as an empty entry, and shows its text field only while other is picked", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1], node: createNode({ hasOther: true }), seed },
      });

      expect(component.find("input").exists()).toBe(false);

      await component.get('[aria-label="Other"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, ""]]]);
    });

    test("writes typed text as the other entry of the answer list", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error: "", isDisabled: false, modelValue: [1, ""], node: createNode({ hasOther: true }), seed },
      });
      await component.get("input").setValue(otherText);
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[[1, otherText]]]);
    });

    test("keeps the other field while its text equals a choice's value, as the answer holds both alike", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: {
          error: "",
          isDisabled: false,
          modelValue: [],
          node: createNode({
            choices: [
              { text: "", value: "a" },
              { text: "", value: "b" },
            ],
            hasOther: true,
          }),
          seed,
        },
      });
      await component.get('[aria-label="Other"]').trigger("click");
      await component.setProps({ modelValue: [""] });
      await component.get("input").setValue("a");
      await component.setProps({ modelValue: ["a"] });

      expect(component.get("input").element.value).toBe("a");
      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([["a"]]);
    });

    test("shows its error beside the group and marks each checkbox invalid", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldCheckbox, {
        props: { error, isDisabled: false, modelValue: [], node: createNode({}), seed },
      });
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="checkbox"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
