import { surveyButtonGroupNodeType } from "#src/services/surveyButtonGroupNodeType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyButtonGroupNodeType", () => {
  test("a button group made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyButtonGroupNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyButtonGroupNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
