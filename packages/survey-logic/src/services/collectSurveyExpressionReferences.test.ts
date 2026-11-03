import { collectSurveyExpressionReferences } from "#src/services/collectSurveyExpressionReferences";
import { parseSurveyExpression } from "#src/services/parseSurveyExpression";
import { describe, expect, test } from "vitest";

// A fault comes back as it is, so a mismatch shows the fault rather than an undefined list
const getReferencesOf = (source: string) =>
  parseSurveyExpression(source).match(
    (node) => collectSurveyExpressionReferences(node),
    (error) => error,
  );

describe(collectSurveyExpressionReferences, () => {
  test.each([
    ["an expression with no references", "1 + 2", []],
    ["a name read twice is listed once", "{a} = 1 and {a} > 0", ["a"]],
    ["names in the order they are first read", "{b} + f({a}, {b}) + {c} = {a}", ["b", "a", "c"]],
    ["names in a list and under a prefix operator", "not {a} and [{b.c}]", ["a", "b.c"]],
  ])("%s", (_title, source, names) => {
    expect.hasAssertions();

    expect(getReferencesOf(source)).toStrictEqual(names);
  });
});
