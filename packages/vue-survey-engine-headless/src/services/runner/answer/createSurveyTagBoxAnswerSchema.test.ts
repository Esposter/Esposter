import type { SurveyTagBoxNode } from "#src/models/SurveyTagBoxNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyTagBoxAnswerSchema } from "#src/services/runner/answer/createSurveyTagBoxAnswerSchema";
import { SURVEY_TOO_MANY_SELECTED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyTagBoxNodeType } from "#src/services/surveyTagBoxNodeType";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createSurveyTagBoxAnswerSchema, () => {
  const node: SurveyTagBoxNode = {
    props: {
      ...surveyTagBoxNodeType.createDefaultProps(),
      choices: [
        { text: "", value: "a" },
        { text: "", value: "b" },
      ],
      id: v7(),
      maxSelected: 1,
    },
    type: SurveyNodeType.TagBox,
  };

  test("accepts a list of tags within the most its owner allows", () => {
    expect.hasAssertions();

    const result = createSurveyTagBoxAnswerSchema(node).safeParse(["a"]);

    expect(result.success).toBe(true);
  });

  test("refuses more tags than the most its owner allows", () => {
    expect.hasAssertions();

    const result = createSurveyTagBoxAnswerSchema(node).safeParse(["a", "b"]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_MANY_SELECTED_MESSAGE);
  });
});
