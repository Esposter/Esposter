import type { SurveyChoice } from "#src/models/SurveyChoice";

import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyRankingNodeType } from "#src/services/surveyRankingNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyRankingNodeType", () => {
  test("a ranking question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyRankingNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyRankingNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });

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
