// @vitest-environment happy-dom
import type { SurveyCommentNode } from "vue-survey-engine-headless";

import SurveyFieldComment from "@/components/Resource/Survey/Field/Comment.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { surveyCommentNodePropsSchema, SurveyNodeType } from "vue-survey-engine-headless";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldComment", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "message";
    const title = "title";
    const createNode = (): SurveyCommentNode => ({
      props: { ...surveyCommentNodePropsSchema.parse({ name: "a", title }), id: crypto.randomUUID() },
      type: SurveyNodeType.Comment,
    });

    test("is named by the question's title, and draws a box of its rows", () => {
      expect.hasAssertions();

      const node = createNode();
      const component = mount(SurveyFieldComment, { props: { error: "", isDisabled: false, node } });
      const control = component.get("textarea");

      expect(component.get(`label[for="${control.attributes("id")}"]`).text()).toBe(title);
      expect(control.attributes("rows")).toBe(String(node.props.rows));
    });

    test("answers with the text typed, and no answer once it is emptied", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldComment, { props: { error: "", isDisabled: false, node: createNode() } });
      const control = component.get("textarea");
      await control.setValue("a");
      await control.setValue("");

      expect(component.emitted("update:modelValue")).toStrictEqual([["a"], [undefined]]);
    });

    test("shows its error beside it and marks it invalid", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldComment, { props: { error, isDisabled: false, node: createNode() } });

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get("textarea").attributes("aria-invalid")).toBe("true");
    });
  });
});
