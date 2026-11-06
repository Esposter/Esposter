import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { createSurveyAnswerSchema } from "#src/services/runner/createSurveyAnswerSchema";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyHtmlNodeType } from "#src/services/surveyHtmlNodeType";
import { describe, expect, test } from "vitest";

describe(createSurveyAnswerSchema, () => {
  const now = new Date(0);

  test("a question that holds no answer refuses any value", () => {
    expect.hasAssertions();

    const node: SurveyHtmlNode = {
      props: { ...surveyHtmlNodeType.createDefaultProps(), id: crypto.randomUUID() },
      type: SurveyNodeType.Html,
    };
    const result = createSurveyAnswerSchema(node, {}, now).safeParse("a");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
