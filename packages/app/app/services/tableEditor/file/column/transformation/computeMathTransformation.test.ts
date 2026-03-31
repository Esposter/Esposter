// @vitest-environment node
import type { MathTransformation } from "#shared/models/tableEditor/file/column/transformation/MathTransformation";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { computeMathTransformation } from "@/services/tableEditor/file/column/transformation/computeMathTransformation";
import { describe, expect, test } from "vitest";

describe(computeMathTransformation, () => {
  const makeTransformation = (
    expression: string,
    variables: { name: string; sourceColumnId: string }[],
  ): MathTransformation => ({
    expression,
    type: ColumnTransformationType.Math,
    variables,
  });

  test("evaluates a basic expression with column variables", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      makeTransformation("col0 * col1", [
        { name: "col0", sourceColumnId: "a" },
        { name: "col1", sourceColumnId: "b" },
      ]),
      (id) => (id === "a" ? 3 : 4),
    );

    expect(result).toBe(12);
  });

  test("respects operator precedence", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      makeTransformation("col0 + col1 * 2", [
        { name: "col0", sourceColumnId: "a" },
        { name: "col1", sourceColumnId: "b" },
      ]),
      (id) => (id === "a" ? 1 : 3),
    );

    expect(result).toBe(7);
  });

  test("coerces null source value to 0", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      makeTransformation("col0 + 10", [{ name: "col0", sourceColumnId: "a" }]),
      () => null,
    );

    expect(result).toBe(10);
  });

  test("returns null for division by zero (Infinity)", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      makeTransformation("col0 / col1", [
        { name: "col0", sourceColumnId: "a" },
        { name: "col1", sourceColumnId: "b" },
      ]),
      (id) => (id === "a" ? 1 : 0),
    );

    expect(result).toBeNull();
  });

  test("returns null for non-finite result (NaN from sqrt of negative)", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      makeTransformation("sqrt(col0)", [{ name: "col0", sourceColumnId: "a" }]),
      () => -1,
    );

    expect(result).toBeNull();
  });

  test("no variables — pure constant expression", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(makeTransformation("2 ^ 10", []), () => null);

    expect(result).toBe(1024);
  });
});
