import { toSurveyAnswerValue } from "#src/services/runner/toSurveyAnswerValue";
import { describe, expect, test } from "vitest";

describe(toSurveyAnswerValue, () => {
  test("no value is not an answer", () => {
    expect.hasAssertions();

    expect(toSurveyAnswerValue(undefined)).toBeUndefined();
  });

  test.each([
    ["a text", "a"],
    ["a number", 0],
    ["a boolean", false],
  ])("%s is stored as itself", (_name, value) => {
    expect.hasAssertions();

    expect(toSurveyAnswerValue(value)).toStrictEqual(value);
  });

  test("a record holding a field with no value is not an answer", () => {
    expect.hasAssertions();

    expect(toSurveyAnswerValue({ a: undefined })).toBeUndefined();
  });

  test("a record of answers is stored field by field", () => {
    expect.hasAssertions();

    expect(toSurveyAnswerValue({ a: { a: "a" }, b: ["a"] })).toStrictEqual({ a: { a: "a" }, b: ["a"] });
  });
});
