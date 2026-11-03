import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyRatingNodeType } from "#src/services/surveyRatingNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyRatingNodeType", () => {
  test("a rating question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyRatingNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyRatingNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
