import { readSurveyLogicPath } from "#src/services/evaluator/readSurveyLogicPath";
import { describe, expect, test } from "vitest";

describe(readSurveyLogicPath, () => {
  test("answers an unresolved name with many dots without re-reading its tails", () => {
    expect.hasAssertions();

    const name = Array.from({ length: 40 }, (_value, index) => `k${index}`).join(".");

    expect(readSurveyLogicPath({ a: 1 }, name)).toBeUndefined();
  });

  test("counts a list under a dotted key before a zero for a missing nested one", () => {
    expect.hasAssertions();

    expect(readSurveyLogicPath({ "q1.items": [1, 2] }, "q1.items.length")).toBe(2);
  });

  test("reads zero for the length of a dotted name nothing holds", () => {
    expect.hasAssertions();

    expect(readSurveyLogicPath({ q1: {} }, "q1.items.length")).toBe(0);
  });
});
