import type { SurveySliderNode } from "#src/models/SurveySliderNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveySliderAnswerSchema } from "#src/services/runner/answer/createSurveySliderAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_OUT_OF_RANGE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveySliderNodeType } from "#src/services/surveySliderNodeType";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createSurveySliderAnswerSchema, () => {
  const node: SurveySliderNode = {
    props: { ...surveySliderNodeType.createDefaultProps(), id: v7(), max: 10, min: 0, step: 2 },
    type: SurveyNodeType.Slider,
  };

  test("accepts a value on a step inside the range", () => {
    expect.hasAssertions();

    const result = createSurveySliderAnswerSchema(node).safeParse(4);

    expect(result.success).toBe(true);
  });

  test("refuses a value above the range", () => {
    expect.hasAssertions();

    const result = createSurveySliderAnswerSchema(node).safeParse(12);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_OUT_OF_RANGE_MESSAGE);
  });

  test("refuses a value between two steps", () => {
    expect.hasAssertions();

    const result = createSurveySliderAnswerSchema(node).safeParse(3);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
