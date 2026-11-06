import { MAX_SURVEY_ANSWER_LENGTH } from "#src/services/constants";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_TOO_LONG_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyAnswerValueSchema } from "#src/services/runner/surveyAnswerValueSchema";
import { describe, expect, test } from "vitest";

describe("surveyAnswerValueSchema", () => {
  test("accepts a value nested three lists or records deep", () => {
    expect.hasAssertions();

    const result = surveyAnswerValueSchema.safeParse([{ a: [1] }]);

    expect(result.success).toBe(true);
  });

  test("refuses a value nested four lists or records deep", () => {
    expect.hasAssertions();

    const result = surveyAnswerValueSchema.safeParse([{ a: [[1]] }]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });

  test("refuses a text longer than the answer length limit", () => {
    expect.hasAssertions();

    const result = surveyAnswerValueSchema.safeParse("a".repeat(MAX_SURVEY_ANSWER_LENGTH + 1));

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_LONG_MESSAGE);
  });
});
