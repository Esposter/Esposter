// @vitest-environment happy-dom
import type { SurveyRadioGroupNode } from "survey-engine";

import SurveyFieldRadioGroup from "@/components/Resource/Survey/Field/RadioGroup.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { SurveyChoicesOrder, SurveyNodeType, surveyRadioGroupNodePropsSchema } from "survey-engine";
import { assert, describe, expect, test } from "vitest";

describe("resourceSurveyFieldRadioGroup", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const choices = [
      { text: "a", value: "a" },
      { text: "b", value: "b" },
      { text: "c", value: "c" },
    ];
    const description = "a";
    const error = "message";
    const title = "Favourite colour";
    const seed = crypto.randomUUID();
    const createNode = (hasOther?: boolean, choicesOrder?: SurveyChoicesOrder): SurveyRadioGroupNode => ({
      props: {
        ...surveyRadioGroupNodePropsSchema.parse({ choices, choicesOrder, hasOther, name: "a", title }),
        id: crypto.randomUUID(),
      },
      type: SurveyNodeType.RadioGroup,
    });

    test("is a radio group named by the question's title, with a radio for each choice", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldRadioGroup, {
        props: { error: "", isDisabled: false, node: createNode(), seed },
      });

      expect(component.get('[role="radiogroup"]').attributes("aria-label")).toBe(title);
      expect(component.findAll('[role="radio"]')).toHaveLength(choices.length);
    });

    test("says it is required through aria-required", () => {
      expect.hasAssertions();

      const node = createNode();
      const component = mount(SurveyFieldRadioGroup, {
        props: { error: "", isDisabled: false, node: { ...node, props: { ...node.props, isRequired: true } }, seed },
      });

      expect(component.get('[role="radiogroup"]').attributes("aria-required")).toBe("true");
    });

    test("lists its choices in descending text order when its choices are ordered so", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldRadioGroup, {
        props: { error: "", isDisabled: false, node: createNode(undefined, SurveyChoicesOrder.Descending), seed },
      });
      const texts = component.findAll('[role="radio"]').map((radio) => radio.text());

      expect(texts).toStrictEqual(["c", "b", "a"]);
    });

    test("answers with the choice an arrow key moves to", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldRadioGroup, {
        props: { error: "", isDisabled: false, node: createNode(), seed },
      });
      const [first] = component.findAll('[role="radio"]');
      await first?.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([["b"]]);
    });

    test("reveals a text field for the other option, whose text is the answer", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldRadioGroup, {
        props: { error: "", isDisabled: false, node: createNode(true), seed },
      });
      const other = component.findAll('[role="radio"]')[choices.length];
      await other?.trigger("click");
      await flushPromises();
      await component.get("input").setValue("a");

      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual(["a"]);
    });

    test("shows its error beside it", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldRadioGroup, { props: { error, isDisabled: false, node: createNode(), seed } });

      expect(component.get('[role="alert"]').text()).toBe(error);
    });

    test("is described by the question's description, then its error", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldRadioGroup, {
        props: {
          error,
          isDisabled: false,
          node: {
            props: {
              ...surveyRadioGroupNodePropsSchema.parse({ choices, description, name: "a", title }),
              id: crypto.randomUUID(),
            },
            type: SurveyNodeType.RadioGroup,
          },
          seed,
        },
      });
      const describedBy = component.get('[role="radiogroup"]').attributes("aria-describedby");
      assert.exists(describedBy);

      expect(describedBy.split(" ").map((id) => component.get(`[id="${id}"]`).text())).toStrictEqual([
        description,
        error,
      ]);
    });
  });
});
