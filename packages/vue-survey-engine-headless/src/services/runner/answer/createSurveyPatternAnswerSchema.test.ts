import { createSurveyPatternAnswerSchema } from "#src/services/runner/answer/createSurveyPatternAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createSurveyPatternAnswerSchema, () => {
  test("accepts a text the pattern finds in it", () => {
    expect.hasAssertions();

    const result = createSurveyPatternAnswerSchema(z.string(), "[0-9]+").safeParse("a1");

    expect(result.success).toBe(true);
  });

  test("refuses a text the pattern does not find in it", () => {
    expect.hasAssertions();

    const result = createSurveyPatternAnswerSchema(z.string(), "[0-9]+").safeParse("a");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });

  test("ignores a pattern RE2 cannot compile rather than refusing every text", () => {
    expect.hasAssertions();

    const result = createSurveyPatternAnswerSchema(z.string(), "(").safeParse("a");

    expect(result.success).toBe(true);
  });

  test("refuses a long text against a pattern that stalls a backtracking engine", () => {
    expect.hasAssertions();

    const result = createSurveyPatternAnswerSchema(z.string(), "(a+)+$").safeParse(`${"a".repeat(40)}!`);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
