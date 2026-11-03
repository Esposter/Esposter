import type { SurveyMultipleTextNode } from "#src/models/SurveyMultipleTextNode";

import { SurveyMultipleTextItemInputType } from "#src/models/SurveyMultipleTextItemInputType";
import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyMultipleTextAnswerSchema } from "#src/services/runner/answer/createSurveyMultipleTextAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyMultipleTextNodeType } from "#src/services/surveyMultipleTextNodeType";
import { describe, expect, test } from "vitest";

describe(createSurveyMultipleTextAnswerSchema, () => {
  const node: SurveyMultipleTextNode = {
    props: {
      ...surveyMultipleTextNodeType.createDefaultProps(),
      id: crypto.randomUUID(),
      items: [
        { inputType: SurveyMultipleTextItemInputType.Text, isRequired: true, name: "a", title: "" },
        { inputType: SurveyMultipleTextItemInputType.Email, isRequired: false, name: "b", title: "" },
      ],
    },
    type: SurveyNodeType.MultipleText,
  };

  test("accepts the items it has, leaving an optional one out", () => {
    expect.hasAssertions();

    const result = createSurveyMultipleTextAnswerSchema(node).safeParse({ a: "a" });

    expect(result.success).toBe(true);
  });

  test("refuses a required item left empty", () => {
    expect.hasAssertions();

    const result = createSurveyMultipleTextAnswerSchema(node).safeParse({ a: "" });

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_REQUIRED_MESSAGE);
  });

  test("refuses an item no name declares", () => {
    expect.hasAssertions();

    const result = createSurveyMultipleTextAnswerSchema(node).safeParse({ a: "a", c: "c" });

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });

  test("refuses an email item that is not an email address", () => {
    expect.hasAssertions();

    const result = createSurveyMultipleTextAnswerSchema(node).safeParse({ a: "a", b: "b" });

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
