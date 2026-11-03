import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyTextNodeType", () => {
  test("a text question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyTextNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyTextNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
