import type { SurveyRadioGroupNode } from "#src/models/SurveyRadioGroupNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyRadioGroupAnswerSchema } from "#src/services/runner/answer/createSurveyRadioGroupAnswerSchema";
import { SURVEY_NONE_ANSWER, SURVEY_NOT_A_CHOICE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyRadioGroupNodeType } from "#src/services/surveyRadioGroupNodeType";
import { describe, expect, test } from "vitest";

const createRadioGroupNode = (hasNone: boolean): SurveyRadioGroupNode => ({
  props: {
    ...surveyRadioGroupNodeType.createDefaultProps(),
    choices: [{ text: "", value: "a" }],
    hasNone,
    id: crypto.randomUUID(),
  },
  type: SurveyNodeType.RadioGroup,
});

describe(createSurveyRadioGroupAnswerSchema, () => {
  test("accepts the none answer when the question has one", () => {
    expect.hasAssertions();

    const result = createSurveyRadioGroupAnswerSchema(createRadioGroupNode(true)).safeParse(SURVEY_NONE_ANSWER);

    expect(result.success).toBe(true);
  });

  test("refuses the none answer when the question has none", () => {
    expect.hasAssertions();

    const result = createSurveyRadioGroupAnswerSchema(createRadioGroupNode(false)).safeParse(SURVEY_NONE_ANSWER);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });
});
