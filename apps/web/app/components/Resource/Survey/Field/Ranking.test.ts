// @vitest-environment nuxt
import type { SurveyAnswerValue, SurveyRankingNode } from "survey-engine";

import ResourceSurveyFieldRanking from "@/components/Resource/Survey/Field/Ranking.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { SurveyNodeType, surveyRankingNodePropsSchema } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldRanking", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const id = crypto.randomUUID();
    const title = "title";
    const node: SurveyRankingNode = {
      props: {
        ...surveyRankingNodePropsSchema.parse({
          choices: [{ value: 0 }, { value: 0.1 }, { value: -1 }],
          name: "a",
          title,
        }),
        id,
      },
      type: SurveyNodeType.Ranking,
    };

    test("is a list named by the question's title", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldRanking, {
        props: { error: "", isDisabled: false, node },
      });

      expect(component.get('[role="list"]').attributes("aria-label")).toBe(title);
    });

    test("a ranking question is reordered by keyboard", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldRanking, {
        attachTo: document.body,
        props: { error: "", isDisabled: false, node },
      });
      const third = takeOne(component.findAll("button"), 2);
      await third.trigger("keydown", { altKey: true, key: "ArrowUp" });

      expect(component.emitted<[SurveyAnswerValue[]]>("update:modelValue")?.map(([answer]) => answer)).toStrictEqual([
        [0, -1, 0.1],
      ]);

      component.unmount();
    });

    test("shows its error beside the list, which is described by it, and marks no list invalid", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldRanking, { props: { error, isDisabled: false, node } });
      const alert = component.get('[role="alert"]');

      expect(alert.text()).toBe(error);
      expect(component.get('[role="list"]').attributes("aria-describedby")).toBe(alert.attributes("id"));
      expect(component.get('[role="list"]').attributes("aria-invalid")).toBeUndefined();
    });
  });
});
