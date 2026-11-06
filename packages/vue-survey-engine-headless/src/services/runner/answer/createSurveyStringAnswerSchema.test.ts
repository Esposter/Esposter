import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import { SURVEY_TOO_LONG_MESSAGE, SURVEY_TOO_SHORT_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { describe, expect, test } from "vitest";

describe(createSurveyStringAnswerSchema, () => {
  test("accepts a text within the lengths its question bounds it to", () => {
    expect.hasAssertions();

    const result = createSurveyStringAnswerSchema({ maxLength: 1, minLength: 1 }).safeParse("a");

    expect(result.success).toBe(true);
  });

  test("refuses a text shorter than the minimum length its question gives", () => {
    expect.hasAssertions();

    const result = createSurveyStringAnswerSchema({ minLength: 2 }).safeParse("a");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_SHORT_MESSAGE);
  });

  test("refuses a text longer than the maximum length its question gives", () => {
    expect.hasAssertions();

    const result = createSurveyStringAnswerSchema({ maxLength: 1 }).safeParse("ab");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_LONG_MESSAGE);
  });
});
