// @vitest-environment nuxt
import type { SurveyAnswerValue, SurveyMatrixNode } from "vue-survey-engine-headless";

import ResourceSurveyFieldMatrix from "@/components/Resource/Survey/Field/Matrix.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyMatrixNodePropsSchema, SurveyNodeType } from "vue-survey-engine-headless";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldMatrix", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const id = crypto.randomUUID();
    const title = "title";
    const createNode = (isRequired: boolean, isAllRowRequired: boolean): SurveyMatrixNode => ({
      props: {
        ...surveyMatrixNodePropsSchema.parse({
          columns: [{ value: -1 }, { value: 0 }],
          isAllRowRequired,
          isRequired,
          name: "a",
          rows: [{ value: 0 }, { value: 0.1 }],
          title,
        }),
        id,
      },
      type: SurveyNodeType.Matrix,
    });
    const node = createNode(false, false);

    test("is a group named by the question's title, whose rows are radio groups named by their choices", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMatrix, {
        props: { error: "", isDisabled: false, node },
      });

      const labelledBy = component.get('[role="group"]').attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(title);
      expect(component.findAll('[role="radiogroup"]').map((group) => group.attributes("aria-label"))).toStrictEqual([
        "0",
        "0.1",
      ]);
    });

    test("says each row is required through aria-required when every row is required", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMatrix, {
        props: { error: "", isDisabled: false, node: createNode(false, true) },
      });

      expect(component.findAll('[role="radiogroup"]').map((group) => group.attributes("aria-required"))).toStrictEqual([
        "true",
        "true",
      ]);
    });

    test("says no row is required when only the question is, since a row is required by its own rule", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMatrix, {
        props: { error: "", isDisabled: false, node: createNode(true, false) },
      });

      expect(component.findAll('[role="radiogroup"]').map((group) => group.attributes("aria-required"))).toStrictEqual([
        undefined,
        undefined,
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

    test("shows its error beside the group and marks each row's choice invalid, not the group", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldMatrix, { props: { error, isDisabled: false, node } });

      expect(component.get('[role="alert"]').text()).toBe(error);
      const radioGroups = component.findAll('[role="radiogroup"]');

      expect(component.get('[role="group"]').attributes("aria-invalid")).toBeUndefined();
      expect(radioGroups).not.toHaveLength(0);
      expect(radioGroups.map((radioGroup) => radioGroup.attributes("aria-invalid"))).toStrictEqual(
        radioGroups.map(() => "true"),
      );
    });
  });
});
