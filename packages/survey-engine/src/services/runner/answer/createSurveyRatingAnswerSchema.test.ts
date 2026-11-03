import type { SurveyRatingNode } from "#src/models/SurveyRatingNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyRatingAnswerSchema } from "#src/services/runner/answer/createSurveyRatingAnswerSchema";
import { SURVEY_OUT_OF_RANGE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyRatingNodeType } from "#src/services/surveyRatingNodeType";
import { describe, expect, test } from "vitest";

describe(createSurveyRatingAnswerSchema, () => {
  const node: SurveyRatingNode = {
    props: { ...surveyRatingNodeType.createDefaultProps(), id: crypto.randomUUID(), rateCount: 3 },
    type: SurveyNodeType.Rating,
  };

  test("accepts a whole rating within the scale its owner set", () => {
    expect.hasAssertions();

    const result = createSurveyRatingAnswerSchema(node).safeParse(3);

    expect(result.success).toBe(true);
  });

  test("refuses a rating above the scale its owner set", () => {
    expect.hasAssertions();

    const result = createSurveyRatingAnswerSchema(node).safeParse(4);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_OUT_OF_RANGE_MESSAGE);
  });
});
