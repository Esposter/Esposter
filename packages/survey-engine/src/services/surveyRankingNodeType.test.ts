import type { SurveyChoice } from "#src/models/SurveyChoice";

import { surveyRankingNodeType } from "#src/services/surveyRankingNodeType";
import { describe, expect, test } from "vitest";

describe("surveyRankingNodeType", () => {
  test("a ranking question refuses two choices that share a value, whatever their texts", () => {
    expect.hasAssertions();

    const choices: SurveyChoice[] = [
      { text: "", value: "" },
      { text: " ", value: "" },
    ];
    const result = surveyRankingNodeType.propsSchema.safeParse({
      ...surveyRankingNodeType.createDefaultProps(),
      choices,
    });

    expect(result.success).toBe(false);
  });
});
