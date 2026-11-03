import { surveyDropdownNodeType } from "#src/services/surveyDropdownNodeType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyDropdownNodeType", () => {
  test("a dropdown made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyDropdownNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyDropdownNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
