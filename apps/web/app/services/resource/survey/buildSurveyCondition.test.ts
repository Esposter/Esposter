import type { SurveyConditionRow } from "@/models/resource/survey/SurveyConditionRow";

import { SurveyConditionJoin } from "@/models/resource/survey/SurveyConditionJoin";
import { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import { buildSurveyCondition } from "@/services/resource/survey/buildSurveyCondition";
import { runSurveyExpression } from "survey-expression";
import { describe, expect, test } from "vitest";

describe(buildSurveyCondition, () => {
  test.each([
    [
      "a string value is quoted",
      [{ operator: SurveyConditionOperator.Equals, questionName: "a", value: "a" }],
      "{a} = 'a'",
    ],
    [
      "a number is written bare",
      [{ operator: SurveyConditionOperator.Greater, questionName: "a", value: 0 }],
      "{a} > 0",
    ],
    [
      "a boolean is written bare",
      [{ operator: SurveyConditionOperator.Equals, questionName: "a", value: true }],
      "{a} = true",
    ],
    [
      "a quote and a backslash in a string are escaped",
      [{ operator: SurveyConditionOperator.Equals, questionName: "a", value: "it's\\" }],
      String.raw`{a} = 'it\'s\\'`,
    ],
    [
      "an empty test takes no value",
      [{ operator: SurveyConditionOperator.Empty, questionName: "a", value: "" }],
      "{a} empty",
    ],
    [
      "a name with dots and spaces is one reference",
      [{ operator: SurveyConditionOperator.NotContains, questionName: "panel.a b", value: "a" }],
      "{panel.a b} notcontains 'a'",
    ],
  ])("%s", (_title, rows, expected) => {
    expect.hasAssertions();

    expect(buildSurveyCondition(rows, SurveyConditionJoin.And)).toBe(expected);
  });

  test("rows are joined by the one connective", () => {
    expect.hasAssertions();

    const rows: SurveyConditionRow[] = [
      { operator: SurveyConditionOperator.Greater, questionName: "a", value: 0 },
      { operator: SurveyConditionOperator.Less, questionName: "a", value: 0 },
    ];

    expect(buildSurveyCondition(rows, SurveyConditionJoin.Or)).toBe("{a} > 0 or {a} < 0");
  });

  test("a row with no question is skipped rather than written", () => {
    expect.hasAssertions();

    const rows: SurveyConditionRow[] = [
      { operator: SurveyConditionOperator.Equals, questionName: "", value: "a" },
      { operator: SurveyConditionOperator.Equals, questionName: "a", value: "a" },
    ];

    expect(buildSurveyCondition(rows, SurveyConditionJoin.And)).toBe("{a} = 'a'");
  });

  test("no rows write no condition", () => {
    expect.hasAssertions();

    expect(buildSurveyCondition([], SurveyConditionJoin.And)).toBe("");
  });

  test("a built condition evaluates true and false on the answers it reads", () => {
    expect.hasAssertions();

    const condition = buildSurveyCondition(
      [
        { operator: SurveyConditionOperator.Equals, questionName: "a", value: "a" },
        { operator: SurveyConditionOperator.NotEquals, questionName: "b", value: "a" },
      ],
      SurveyConditionJoin.And,
    );

    expect(
      runSurveyExpression(condition, { now: new Date(0), scopes: {}, values: { a: "a", b: "b" } }).unwrapOr(undefined),
    ).toBe(true);
    expect(
      runSurveyExpression(condition, { now: new Date(0), scopes: {}, values: { a: "b", b: "b" } }).unwrapOr(undefined),
    ).toBe(false);
  });
});
