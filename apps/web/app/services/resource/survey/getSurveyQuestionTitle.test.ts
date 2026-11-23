import { getSurveyQuestionTitle } from "#src/services/resource/survey/getSurveyQuestionTitle";
import { describe, expect, test } from "vitest";

describe(getSurveyQuestionTitle, () => {
  test("a title of spaces only reads as the name", () => {
    expect.hasAssertions();

    expect(getSurveyQuestionTitle({ name: "a", title: " " })).toBe("a");
  });
});
