import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyMatrixNodeType } from "#src/services/surveyMatrixNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyMatrixNodeType", () => {
  test("a matrix question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyMatrixNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyMatrixNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });

  test("a matrix refuses a row list that repeats a value", () => {
    expect.hasAssertions();

    const row = { text: "", value: "" };
    const result = surveyMatrixNodeType.propsSchema.safeParse({
      ...surveyMatrixNodeType.createDefaultProps(),
      rows: [row, row],
    });

    expect(result.success).toBe(false);
  });

  test("a matrix refuses a column list that repeats a value", () => {
    expect.hasAssertions();

    const column = { text: "", value: "" };
    const result = surveyMatrixNodeType.propsSchema.safeParse({
      ...surveyMatrixNodeType.createDefaultProps(),
      columns: [column, column],
    });

    expect(result.success).toBe(false);
  });
});
