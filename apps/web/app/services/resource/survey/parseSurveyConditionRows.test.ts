import { SurveyConditionJoin } from "@/models/resource/survey/SurveyConditionJoin";
import { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import { buildSurveyCondition } from "@/services/resource/survey/buildSurveyCondition";
import { parseSurveyConditionRows } from "@/services/resource/survey/parseSurveyConditionRows";
import { describe, expect, test } from "vitest";

describe(parseSurveyConditionRows, () => {
  test.each([
    [
      "one comparison",
      [{ operator: SurveyConditionOperator.Equals, questionName: "a", value: "a" }],
      SurveyConditionJoin.And,
    ],
    [
      "rows joined by and",
      [
        { operator: SurveyConditionOperator.Equals, questionName: "a", value: "a" },
        { operator: SurveyConditionOperator.Greater, questionName: "b", value: 0 },
      ],
      SurveyConditionJoin.And,
    ],
    [
      "rows joined by or",
      [
        { operator: SurveyConditionOperator.Equals, questionName: "a", value: true },
        { operator: SurveyConditionOperator.NotContains, questionName: "b", value: "a" },
      ],
      SurveyConditionJoin.Or,
    ],
    [
      "an empty test beside a comparison",
      [
        { operator: SurveyConditionOperator.NotEmpty, questionName: "a", value: "" },
        { operator: SurveyConditionOperator.LessOrEquals, questionName: "b", value: 1.5 },
      ],
      SurveyConditionJoin.Or,
    ],
    [
      "a negative number",
      [{ operator: SurveyConditionOperator.Less, questionName: "a", value: -1 }],
      SurveyConditionJoin.And,
    ],
    [
      "a string with a quote and a backslash",
      [{ operator: SurveyConditionOperator.Equals, questionName: "a", value: "it's\\" }],
      SurveyConditionJoin.And,
    ],
    [
      "a name with dots and spaces",
      [{ operator: SurveyConditionOperator.Contains, questionName: "panel.a b", value: "a" }],
      SurveyConditionJoin.And,
    ],
  ])("a condition of %s reads back as the rows it was built from", (_title, rows, join) => {
    expect.hasAssertions();

    expect(parseSurveyConditionRows(buildSurveyCondition(rows, join))).toStrictEqual({ join, rows });
  });

  test.each([
    ["an empty text", ""],
    ["a text of spaces", "   "],
  ])("%s holds no rows", (_title, source) => {
    expect.hasAssertions();

    expect(parseSurveyConditionRows(source)).toStrictEqual({ join: SurveyConditionJoin.And, rows: [] });
  });

  test.each([
    ["a group inside the chain", "({a} = 'a' or {b} = 'a') and {c} = 'a'"],
    ["a connective nested on the right", "{a} = 'a' and ({b} = 'a' or {c} = 'a')"],
    ["connectives mixed", "{a} = 'a' or {b} = 'a' and {c} = 'a'"],
    ["a function call", "round({a}, 1) = 1"],
    ["an arithmetic operand", "{a} + 1 = 2"],
    ["a list", "{a} anyof ['a']"],
    ["a reference compared with a reference", "{a} = {b}"],
    ["a literal compared with a reference", "'a' = {a}"],
    ["a negation", "not {a} = 'a'"],
    ["a text that does not parse", "{a} >"],
  ])("%s is no rows", (_title, source) => {
    expect.hasAssertions();

    expect(parseSurveyConditionRows(source)).toBeUndefined();
  });
});
