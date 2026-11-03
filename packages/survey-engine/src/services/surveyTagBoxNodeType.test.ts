import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyTagBoxNodeType } from "#src/services/surveyTagBoxNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyTagBoxNodeType", () => {
  test("a tag box made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyTagBoxNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyTagBoxNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
