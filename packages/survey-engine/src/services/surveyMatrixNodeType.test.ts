import { surveyMatrixNodeType } from "#src/services/surveyMatrixNodeType";
import { describe, expect, test } from "vitest";

describe("surveyMatrixNodeType", () => {
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
