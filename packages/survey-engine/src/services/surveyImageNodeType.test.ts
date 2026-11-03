import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyImageNodeType } from "#src/services/surveyImageNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyImageNodeType", () => {
  test("an image made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyImageNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyImageNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
