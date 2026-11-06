import { createSurveyBooleanAnswerSchema } from "#src/services/runner/answer/createSurveyBooleanAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { describe, expect, test } from "vitest";

describe(createSurveyBooleanAnswerSchema, () => {
  test("accepts a yes or no answer, true or false", () => {
    expect.hasAssertions();

    const schema = createSurveyBooleanAnswerSchema();

    expect(schema.safeParse(true).success).toBe(true);
    expect(schema.safeParse(false).success).toBe(true);
  });

  test("refuses a yes or no given as the text true, with the shared invalid message", () => {
    expect.hasAssertions();

    const result = createSurveyBooleanAnswerSchema().safeParse("true");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
