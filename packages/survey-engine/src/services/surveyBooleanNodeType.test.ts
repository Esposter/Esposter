import { surveyBooleanNodeType } from "#src/services/surveyBooleanNodeType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyBooleanNodeType", () => {
  test("a yes or no question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyBooleanNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyBooleanNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
