import type { SurveyCommentNode } from "#src/models/SurveyCommentNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyCommentAnswerSchema } from "#src/services/runner/answer/createSurveyCommentAnswerSchema";
import { SURVEY_TOO_LONG_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyCommentNodeType } from "#src/services/surveyCommentNodeType";
import { describe, expect, test } from "vitest";

describe(createSurveyCommentAnswerSchema, () => {
  const node: SurveyCommentNode = {
    props: { ...surveyCommentNodeType.createDefaultProps(), id: crypto.randomUUID(), maxLength: 1 },
    type: SurveyNodeType.Comment,
  };

  test("accepts a comment within the length its owner bounds it to", () => {
    expect.hasAssertions();

    const result = createSurveyCommentAnswerSchema(node).safeParse("a");

    expect(result.success).toBe(true);
  });

  test("refuses a comment longer than the length its owner bounds it to", () => {
    expect.hasAssertions();

    const result = createSurveyCommentAnswerSchema(node).safeParse("ab");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_LONG_MESSAGE);
  });
});
