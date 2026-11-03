import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveySliderNodeType } from "#src/services/surveySliderNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveySliderNodeType", () => {
  test("a slider question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveySliderNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveySliderNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
