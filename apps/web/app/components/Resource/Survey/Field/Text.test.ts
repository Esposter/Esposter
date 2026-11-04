// @vitest-environment happy-dom
import type { SurveyTextNode } from "survey-engine";

import SurveyFieldText from "@/components/Resource/Survey/Field/Text.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { SurveyNodeType, SurveyTextInputType, surveyTextNodePropsSchema } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldText", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "message";
    const title = "title";
    const createNode = (inputType?: SurveyTextInputType): SurveyTextNode => ({
      props: { ...surveyTextNodePropsSchema.parse({ inputType, name: "a", title }), id: crypto.randomUUID() },
      type: SurveyNodeType.Text,
    });

    test("is named by the question's title", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldText, { props: { error: "", isDisabled: false, node: createNode() } });
      const control = component.get("input");

      expect(component.get(`label[for="${control.attributes("id")}"]`).text()).toBe(title);
    });

    test("shows an empty field while the question has no answer", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldText, { props: { error: "", isDisabled: false, node: createNode() } });

      expect(component.get<HTMLInputElement>("input").element.value).toBe("");
    });

    test("answers with the text typed, and no answer once it is emptied", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldText, { props: { error: "", isDisabled: false, node: createNode() } });
      const control = component.get("input");
      await control.setValue("a");
      await control.setValue("");

      expect(component.emitted("update:modelValue")).toStrictEqual([["a"], [undefined]]);
    });

    test("draws an email question as an email field, with the browser's email autofill", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: createNode(SurveyTextInputType.Email) },
      });
      const control = component.get("input");

      expect(control.attributes("type")).toBe("email");
      expect(control.attributes("autocomplete")).toBe("email");
    });

    test("marks a required question's label with the required mark, and says it is required through the input", () => {
      expect.hasAssertions();

      const node = createNode();
      const component = mount(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: { ...node, props: { ...node.props, isRequired: true } } },
      });

      expect(component.get("label").text()).toBe(`${title} *`);
      expect(component.get("input").attributes("aria-required")).toBe("true");
    });

    test("answers a number question with a number", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: createNode(SurveyTextInputType.Number) },
      });
      await component.get("input").setValue("0.1");

      expect(component.emitted("update:modelValue")).toStrictEqual([[0.1]]);
    });

    test("shows its error beside it and marks it invalid", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldText, { props: { error, isDisabled: false, node: createNode() } });

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get("input").attributes("aria-invalid")).toBe("true");
    });
  });
});
