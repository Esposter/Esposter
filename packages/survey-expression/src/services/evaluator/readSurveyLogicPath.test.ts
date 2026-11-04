import { readSurveyLogicPath } from "#src/services/evaluator/readSurveyLogicPath";
import { describe, expect, test } from "vitest";

describe(readSurveyLogicPath, () => {
  test("answers an unresolved name with many dots without re-reading its tails", () => {
    expect.hasAssertions();

    const name = Array.from({ length: 40 }, (_value, index) => `k${index}`).join(".");

    expect(readSurveyLogicPath({ a: 1 }, name)).toBeUndefined();
  });
});
