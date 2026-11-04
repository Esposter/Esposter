import type { SurveyRankingNode } from "#src/models/SurveyRankingNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyRankingAnswerSchema } from "#src/services/runner/answer/createSurveyRankingAnswerSchema";
import { surveyRankingNodeType } from "#src/services/surveyRankingNodeType";
import { describe, expect, test } from "vitest";

describe(createSurveyRankingAnswerSchema, () => {
  const node: SurveyRankingNode = {
    props: {
      ...surveyRankingNodeType.createDefaultProps(),
      choices: [
        { text: "", value: "a" },
        { text: "", value: "b" },
      ],
      id: crypto.randomUUID(),
    },
    type: SurveyNodeType.Ranking,
  };

  test("accepts its choices in any order", () => {
    expect.hasAssertions();

    const result = createSurveyRankingAnswerSchema(node).safeParse(["b", "a"]);

    expect(result.success).toBe(true);
  });

  test("refuses a choice ranked twice", () => {
    expect.hasAssertions();

    const result = createSurveyRankingAnswerSchema(node).safeParse(["a", "a"]);

    expect(result.success).toBe(false);
  });
});
