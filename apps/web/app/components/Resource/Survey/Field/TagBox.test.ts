// @vitest-environment happy-dom
import type { SurveyTagBoxNode, SurveyTagBoxNodeProps } from "survey-engine";

import ResourceSurveyFieldTagBox from "@/components/Resource/Survey/Field/TagBox.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { surveyTagBoxNodePropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldTagBox", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const choices = [
      { text: "", value: 1 },
      { text: "", value: 2 },
    ];
    const error = "error";
    const title = "Favourite colour";
    const createNode = (props: Partial<SurveyTagBoxNodeProps>): SurveyTagBoxNode => ({
      props: {
        ...surveyTagBoxNodePropsSchema.parse({ choices, name: "question", title, ...props }),
        id: crypto.randomUUID(),
      },
      type: SurveyNodeType.TagBox,
    });

    test("is a named select that shows the titles of the choices it holds", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldTagBox, {
        props: { error: "", isDisabled: false, modelValue: [2], node: createNode({}) },
      });
      const activator = component.get('[role="combobox"]');

      expect(activator.attributes("aria-label")).toBe(title);
      expect(activator.text()).toBe("2");
    });

    test("adds a picked option's choice to the answer list", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldTagBox, {
        attachTo: document.body,
        props: { error: "", isDisabled: false, modelValue: [], node: createNode({}) },
      });
      const activator = component.get('[role="combobox"]');
      await activator.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      await component.findAll('[role="option"]')[1]?.trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[2]]]);
    });

    test("picks other as an empty entry when it has other", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldTagBox, {
        attachTo: document.body,
        props: { error: "", isDisabled: false, modelValue: [], node: createNode({ hasOther: true }) },
      });
      const activator = component.get('[role="combobox"]');
      await activator.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      await component.findAll('[role="option"]')[choices.length]?.trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[[""]]]);
    });

    test("keeps the other field while its text equals a choice's value, as the answer holds both alike", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldTagBox, {
        attachTo: document.body,
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
        },
      });
      await component.get('[role="combobox"]').trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      await component.findAll('[role="option"]')[2]?.trigger("click");
      await component.setProps({ modelValue: [""] });
      await component.get('input[type="text"]').setValue("a");
      await component.setProps({ modelValue: ["a"] });

      expect(component.get('input[type="text"]').element.value).toBe("a");
      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([["a"]]);
    });

    test("shows its error beside the select", async () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldTagBox, {
        props: { error, isDisabled: false, modelValue: [], node: createNode({}) },
      });
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(error);
    });
  });
});
