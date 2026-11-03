import { createSurveyExpressionAnswerSchema } from "#src/services/runner/answer/createSurveyExpressionAnswerSchema";
import { describe, expect, test } from "vitest";

describe(createSurveyExpressionAnswerSchema, () => {
  test("accepts a calculated value that is text, a number or a yes or no", () => {
    expect.hasAssertions();

    const schema = createSurveyExpressionAnswerSchema();

    expect(schema.safeParse("a").success).toBe(true);
    expect(schema.safeParse(1).success).toBe(true);
    expect(schema.safeParse(true).success).toBe(true);
  });
});
