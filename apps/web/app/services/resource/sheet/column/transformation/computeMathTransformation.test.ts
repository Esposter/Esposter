import type { MathTransformation } from "#shared/models/resource/sheet/column/transformation/MathTransformation";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { computeMathTransformation } from "@/services/resource/sheet/column/transformation/computeMathTransformation";
import { describe, expect, test } from "vitest";

const createTransformation = (
  expression: string,
  variables: { name: string; sourceColumnId: string }[],
): MathTransformation => ({
  expression,
  type: ColumnTransformationType.Math,
  variables,
});

describe(computeMathTransformation, () => {
  test("evaluates a basic expression with column variables", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      createTransformation("a * b", [
        { name: "a", sourceColumnId: "a" },
        { name: "b", sourceColumnId: "b" },
      ]),
      (id) => (id === "a" ? 2 : 3),
    );

    expect(result).toBe(6);
  });

  test("coerces null source value to 0", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      createTransformation("a + 1", [{ name: "a", sourceColumnId: "a" }]),
      () => null,
    );

    expect(result).toBe(1);
  });

  test("returns null for division by zero (Infinity)", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      createTransformation("a / b", [
        { name: "a", sourceColumnId: "a" },
        { name: "b", sourceColumnId: "b" },
      ]),
      (id) => (id === "a" ? 1 : 0),
    );

    expect(result).toBeNull();
  });

  test("returns null for non-finite result (NaN from sqrt of negative)", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(
      createTransformation("sqrt(a)", [{ name: "a", sourceColumnId: "a" }]),
      () => -1,
    );

    expect(result).toBeNull();
  });

  test("no variables — pure constant expression", () => {
    expect.hasAssertions();

    const result = computeMathTransformation(createTransformation("2 ^ 2", []), () => null);

    expect(result).toBe(4);
  });
});
