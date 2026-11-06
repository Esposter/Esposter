import type { SurveyDropdownNode } from "#src/models/SurveyDropdownNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyDropdownAnswerSchema } from "#src/services/runner/answer/createSurveyDropdownAnswerSchema";
import { SURVEY_NOT_A_CHOICE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyDropdownNodeType } from "#src/services/surveyDropdownNodeType";
import { describe, expect, test } from "vitest";

const createDropdownNode = (hasOther: boolean): SurveyDropdownNode => ({
  props: {
    ...surveyDropdownNodeType.createDefaultProps(),
    choices: [{ text: "", value: "a" }],
    hasOther,
    id: crypto.randomUUID(),
  },
  type: SurveyNodeType.Dropdown,
});

describe(createSurveyDropdownAnswerSchema, () => {
  test("accepts any text as its other answer when the question has one", () => {
    expect.hasAssertions();

    const result = createSurveyDropdownAnswerSchema(createDropdownNode(true)).safeParse("b");

    expect(result.success).toBe(true);
  });

  test("refuses text that is not one of its choices when the question has no other answer", () => {
    expect.hasAssertions();

    const result = createSurveyDropdownAnswerSchema(createDropdownNode(false)).safeParse("b");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });
});
