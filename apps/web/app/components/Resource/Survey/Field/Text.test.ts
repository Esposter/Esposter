// @vitest-environment nuxt
import type { SurveyTextNode } from "vue-survey-engine-headless";

import SurveyFieldText from "#src/components/Resource/Survey/Field/Text.vue";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { UiStyles } from "#src/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import { SurveyNodeType, SurveyTextInputType, surveyTextNodePropsSchema } from "vue-survey-engine-headless";

describe("resourceSurveyFieldText", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "message";
    const title = "title";
    const createNode = (inputType?: SurveyTextInputType): SurveyTextNode => ({
      props: { ...surveyTextNodePropsSchema.parse({ inputType, name: "a", title }), id: v7() },
      type: SurveyNodeType.Text,
    });

    test("is named by the question's title", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: createNode() },
      });
      const control = component.get("input");

      expect(component.get(`label[for="${control.attributes("id")}"]`).text()).toBe(title);
    });

    test("shows an empty field while the question has no answer", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: createNode() },
      });

      expect(component.get<HTMLInputElement>("input").element.value).toBe("");
    });

    test("answers with the text typed, and no answer once it is emptied", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: createNode() },
      });
      const control = component.get("input");
      await control.setValue("a");
      await control.setValue("");

      expect(component.emitted("update:modelValue")).toStrictEqual([["a"], [undefined]]);
    });

    test("draws an email question as an email field, with the browser's email autofill", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: createNode(SurveyTextInputType.Email) },
      });
      const control = component.get("input");

      expect(control.attributes("type")).toBe("email");
      expect(control.attributes("autocomplete")).toBe("email");
    });

    test("marks a required question's label with the required mark, and says it is required through the input", async () => {
      expect.hasAssertions();

      const node = createNode();
      const component = await mountSuspended(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: { ...node, props: { ...node.props, isRequired: true } } },
      });

      expect(component.get("label").text()).toBe(`${title} *`);
      expect(component.get("input").attributes("aria-required")).toBe("true");
    });

    test("answers a number question with a number", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(SurveyFieldText, {
        props: { error: "", isDisabled: false, node: createNode(SurveyTextInputType.Number) },
      });
      await component.get("input").setValue("0.1");

      expect(component.emitted("update:modelValue")).toStrictEqual([[0.1]]);
    });

    test("shows its error beside it and marks it invalid", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(SurveyFieldText, {
        props: { error, isDisabled: false, node: createNode() },
      });

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get("input").attributes("aria-invalid")).toBe("true");
    });

    test("describes a date field's trigger by the description and the error, after its value", async () => {
      expect.hasAssertions();

      const description = "description";
      const node: SurveyTextNode = {
        props: {
          ...surveyTextNodePropsSchema.parse({ description, inputType: SurveyTextInputType.Date, name: "a", title }),
          id: v7(),
        },
        type: SurveyNodeType.Text,
      };
      const component = await mountSuspended(SurveyFieldText, { props: { error, isDisabled: false, node } });
      const describedBy = component.get("button[aria-describedby]").attributes("aria-describedby")?.split(" ") ?? [];

      expect(describedBy.slice(1).map((id) => component.get(`[id="${id}"]`).text())).toStrictEqual([
        description,
        error,
      ]);
    });
  });
});
