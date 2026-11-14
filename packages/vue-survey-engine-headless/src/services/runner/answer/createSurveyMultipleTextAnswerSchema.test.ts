import type { SurveyMultipleTextNode } from "#src/models/SurveyMultipleTextNode";

import { SurveyMultipleTextItemInputType } from "#src/models/SurveyMultipleTextItemInputType";
import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyMultipleTextAnswerSchema } from "#src/services/runner/answer/createSurveyMultipleTextAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyMultipleTextNodeType } from "#src/services/surveyMultipleTextNodeType";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createSurveyMultipleTextAnswerSchema, () => {
  const node: SurveyMultipleTextNode = {
    props: {
      ...surveyMultipleTextNodeType.createDefaultProps(),
      id: v7(),
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

  test("accepts an optional item left empty", () => {
    expect.hasAssertions();

    const result = createSurveyMultipleTextAnswerSchema(node).safeParse({ a: "a", b: "" });

    expect(result.success).toBe(true);
  });

  test.each([
    ["whose key is absent", {}],
    ["left empty", { a: "" }],
    ["left as spaces", { a: " " }],
  ])("refuses a required item %s, naming the item", (_label, answer) => {
    expect.hasAssertions();

    const result = createSurveyMultipleTextAnswerSchema(node).safeParse(answer);

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: SURVEY_REQUIRED_MESSAGE, path: ["a"] },
    ]);
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
