// @vitest-environment nuxt
import type { SurveyAnswerValue, SurveyMatrixNode } from "survey-engine";

import ResourceSurveyFieldMatrix from "@/components/Resource/Survey/Field/Matrix.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyMatrixNodePropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldMatrix", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const id = crypto.randomUUID();
    const title = "title";
    const node: SurveyMatrixNode = {
      props: {
        ...surveyMatrixNodePropsSchema.parse({
          columns: [{ value: -1 }, { value: 0 }],
          name: "a",
          rows: [{ value: 0 }, { value: 0.1 }],
          title,
        }),
        id,
      },
      type: SurveyNodeType.Matrix,
    };

    test("is a group named by the question's title, whose rows are radio groups named by their choices", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMatrix, {
        props: { error: "", isDisabled: false, node },
      });

      expect(component.get('[role="group"]').attributes("aria-label")).toBe(title);
      expect(component.findAll('[role="radiogroup"]').map((group) => group.attributes("aria-label"))).toStrictEqual([
        "0",
        "0.1",
      ]);
    });

    test("chooses a column of a row by click, and moves the choice by the arrows", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMatrix, {
        props: { error: "", isDisabled: false, node },
      });
      const [firstGroup] = component.findAll('[role="radiogroup"]');
      const [first] = firstGroup?.findAll('[role="radio"]') ?? [];
      await first?.trigger("click");
      await first?.trigger("keydown", { key: "ArrowDown" });

      expect(
        component.emitted<[Record<string, SurveyAnswerValue>]>("update:modelValue")?.map(([answer]) => answer),
      ).toStrictEqual([{ "0": -1 }, { "0": 0 }]);
    });

    test("shows its error beside the group and marks the group invalid", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMatrix, { props: { error, isDisabled: false, node } });

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="group"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
