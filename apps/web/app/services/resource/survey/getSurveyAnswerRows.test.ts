import { getSurveyAnswerRows } from "@/services/resource/survey/getSurveyAnswerRows";
import { describe, expect, test } from "vitest";

describe("getSurveyAnswerRows", () => {
  test("holds the count of empty rows while nothing is answered", () => {
    expect.hasAssertions();

    expect(getSurveyAnswerRows(undefined, 2)).toStrictEqual([{}, {}]);
  });

  test("reads a row holding no record as an empty one, keeping its place in the list", () => {
    expect.hasAssertions();

    expect(getSurveyAnswerRows(["a", { b: "c" }], 0)).toStrictEqual([{}, { b: "c" }]);
  });
});
