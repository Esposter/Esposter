import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyRadioGroupNodeType } from "#src/services/surveyRadioGroupNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyRadioGroupNodeType", () => {
  test("a radio group made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyRadioGroupNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyRadioGroupNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
