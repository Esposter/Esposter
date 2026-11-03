import { surveyCheckboxNodeType } from "#src/services/surveyCheckboxNodeType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyCheckboxNodeType", () => {
  test("a checkboxes question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyCheckboxNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyCheckboxNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
