import type { SurveyButtonGroupNode } from "#src/models/SurveyButtonGroupNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyButtonGroupAnswerSchema } from "#src/services/runner/answer/createSurveyButtonGroupAnswerSchema";
import { SURVEY_NOT_A_CHOICE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyButtonGroupNodeType } from "#src/services/surveyButtonGroupNodeType";
import { describe, expect, test } from "vitest";

describe(createSurveyButtonGroupAnswerSchema, () => {
  const node: SurveyButtonGroupNode = {
    props: {
      ...surveyButtonGroupNodeType.createDefaultProps(),
      choices: [{ text: "", value: "a" }],
      id: crypto.randomUUID(),
    },
    type: SurveyNodeType.ButtonGroup,
  };

  test("accepts one of its choices", () => {
    expect.hasAssertions();

    const result = createSurveyButtonGroupAnswerSchema(node).safeParse("a");

    expect(result.success).toBe(true);
  });

  test("refuses a value that is not one of its choices", () => {
    expect.hasAssertions();

    const result = createSurveyButtonGroupAnswerSchema(node).safeParse("b");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });
});
