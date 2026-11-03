import { readSurveyLogicPath } from "#src/services/evaluator/readSurveyLogicPath";
import { describe, expect, test } from "vitest";

describe(readSurveyLogicPath, () => {
  test("reads a dotted name through the records it names", () => {
    expect.hasAssertions();

    expect(readSurveyLogicPath({ a: { b: 1 } }, "a.b")).toBe(1);
  });

  test("reads the length of a list under its name", () => {
    expect.hasAssertions();

    expect(readSurveyLogicPath({ list: [1, 2] }, "list.length")).toBe(2);
  });

  test("answers an unresolved name with many dots without re-reading its tails", () => {
    expect.hasAssertions();

    const name = Array.from({ length: 40 }, (_value, index) => `k${index}`).join(".");

    expect(readSurveyLogicPath({ a: 1 }, name)).toBeUndefined();
  });
});
