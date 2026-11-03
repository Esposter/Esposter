import { toSurveyLogicValue } from "#src/services/runner/toSurveyLogicValue";
import { describe, expect, test } from "vitest";

describe(toSurveyLogicValue, () => {
  test.each([
    ["a text", "a"],
    ["a number", 0],
    ["a boolean", false],
  ])("%s reads as itself", (_name, value) => {
    expect.hasAssertions();

    expect(toSurveyLogicValue(value)).toStrictEqual(value);
  });

  test("a list reads item by item", () => {
    expect.hasAssertions();

    expect(toSurveyLogicValue(["a", 0])).toStrictEqual(["a", 0]);
  });

  test("a record reads field by field, a nested record included", () => {
    expect.hasAssertions();

    expect(toSurveyLogicValue({ a: { a: "a" }, b: ["a"] })).toStrictEqual({ a: { a: "a" }, b: ["a"] });
  });
});
