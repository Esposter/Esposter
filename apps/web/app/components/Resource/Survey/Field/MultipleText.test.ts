// @vitest-environment nuxt
import type { SurveyAnswerValue, SurveyMultipleTextNode } from "survey-engine";

import ResourceSurveyFieldMultipleText from "@/components/Resource/Survey/Field/MultipleText.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyMultipleTextNodePropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldMultipleText", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const id = crypto.randomUUID();
    const itemTitles = ["A", "B"];
    const text = "text";
    const title = "title";
    const node: SurveyMultipleTextNode = {
      props: {
        ...surveyMultipleTextNodePropsSchema.parse({
          items: [
            { inputType: "text", name: "a", title: "A" },
            { inputType: "text", name: "b", title: "B" },
          ],
          name: "a",
          title,
        }),
        id,
      },
      type: SurveyNodeType.MultipleText,
    };

    test("is a group named by the question's title, whose inputs are named by their titles", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMultipleText, {
        props: { error: "", isDisabled: false, node },
      });

      expect(component.get('[role="group"]').attributes("aria-label")).toBe(title);
      expect(component.findAll("label").map((label) => label.text())).toStrictEqual(itemTitles);
    });

    test("takes the text typed into an item as that item's answer", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMultipleText, {
        props: { error: "", isDisabled: false, node },
      });
      const [first] = component.findAll("input");
      await first?.setValue(text);

      expect(
        component.emitted<[Record<string, SurveyAnswerValue>]>("update:modelValue")?.map(([answer]) => answer),
      ).toStrictEqual([{ a: text }]);
    });

    test("shows its error beside the group and marks the group invalid", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMultipleText, {
        props: { error, isDisabled: false, node },
      });

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="group"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
