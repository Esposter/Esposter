import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";
import { describe, expect, test } from "vitest";

describe(checkSurveyExpressionHolds, () => {
  const now = new Date(0);

  test.each([
    ["a truthy result holds", "{a} = 'a'", { a: "a" }, true],
    ["a falsy result does not hold", "{a} = 'a'", { a: "b" }, false],
    ["a number other than zero is truthy", "{a}", { a: 1 }, true],
    ["a zero is falsy", "{a}", { a: 0 }, false],
    ["a fault does not hold", "({a}", { a: "a" }, false],
  ])("%s", (_name, source, values, expected) => {
    expect.hasAssertions();

    expect(checkSurveyExpressionHolds(source, values, now)).toBe(expected);
  });
});
