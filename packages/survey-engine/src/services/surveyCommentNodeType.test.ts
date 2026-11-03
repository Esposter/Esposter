import { surveyCommentNodeType } from "#src/services/surveyCommentNodeType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyCommentNodeType", () => {
  test("a comment question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyCommentNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyCommentNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });
});
