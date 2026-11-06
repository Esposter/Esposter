import { createSurveyRatingValueSchema } from "#src/services/runner/answer/createSurveyRatingValueSchema";
import { SURVEY_OUT_OF_RANGE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { describe, expect, test } from "vitest";

describe(createSurveyRatingValueSchema, () => {
  test("accepts a whole rating within its scale", () => {
    expect.hasAssertions();

    const result = createSurveyRatingValueSchema(3).safeParse(3);

    expect(result.success).toBe(true);
  });

  test("refuses a rating above the last step of its scale", () => {
    expect.hasAssertions();

    const result = createSurveyRatingValueSchema(3).safeParse(4);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_OUT_OF_RANGE_MESSAGE);
  });
});
