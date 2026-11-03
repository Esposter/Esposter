import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyCheckboxAnswerSchema } from "#src/services/runner/answer/createSurveyCheckboxAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_TOO_MANY_SELECTED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyCheckboxNodeType } from "#src/services/surveyCheckboxNodeType";
import { describe, expect, test } from "vitest";

const createCheckboxNode = (props: Partial<SurveyCheckboxNode["props"]>): SurveyCheckboxNode => ({
  props: {
    ...surveyCheckboxNodeType.createDefaultProps(),
    choices: [
      { text: "", value: "a" },
      { text: "", value: "b" },
    ],
    id: crypto.randomUUID(),
    ...props,
  },
  type: SurveyNodeType.Checkbox,
});

describe(createSurveyCheckboxAnswerSchema, () => {
  test("accepts a list of its choices within the selection bounds its owner gives", () => {
    expect.hasAssertions();

    const schema = createSurveyCheckboxAnswerSchema(createCheckboxNode({ maxSelected: 2, minSelected: 1 }));

    expect(schema.safeParse(["a", "b"]).success).toBe(true);
  });

  test("refuses more choices than the maximum its owner gives", () => {
    expect.hasAssertions();

    const schema = createSurveyCheckboxAnswerSchema(createCheckboxNode({ maxSelected: 1 }));

    expect(getSurveyFirstMessage(schema.safeParse(["a", "b"]))).toBe(SURVEY_TOO_MANY_SELECTED_MESSAGE);
  });

  test("refuses none picked beside another choice when the question has a none answer", () => {
    expect.hasAssertions();

    const schema = createSurveyCheckboxAnswerSchema(createCheckboxNode({ hasNone: true }));

    expect(getSurveyFirstMessage(schema.safeParse(["none", "a"]))).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
