import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { MathTransformation } from "#shared/models/resource/sheet/column/transformation/MathTransformation";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { compileMathTransformation } from "#shared/services/resource/sheet/column/transformation/compileMathTransformation";
import { describe, expect, test } from "vitest";

const createTransformation = (
  expression: string,
  variables: { name: string; sourceColumnId: string }[],
): MathTransformation => ({ expression, type: ColumnTransformationType.Math, variables });

const readMath = (transformation: MathTransformation, readValue: (sourceColumnId: string) => ColumnValue) =>
  compileMathTransformation(
    transformation,
    () => undefined,
  )({ readSource: (sourceColumnId) => () => readValue(sourceColumnId), rows: [] })(createRow({}));

describe(compileMathTransformation, () => {
  test("evaluates a basic expression with column variables", () => {
    expect.hasAssertions();

    const result = readMath(
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

    const result = readMath(createTransformation("a + 1", [{ name: "a", sourceColumnId: "a" }]), () => null);

    expect(result).toBe(1);
  });

  test("returns null for division by zero (Infinity)", () => {
    expect.hasAssertions();

    const result = readMath(
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

    const result = readMath(createTransformation("sqrt(a)", [{ name: "a", sourceColumnId: "a" }]), () => -1);

    expect(result).toBeNull();
  });

  test("no variables, a pure constant expression", () => {
    expect.hasAssertions();

    const result = readMath(createTransformation("2 ^ 2", []), () => null);

    expect(result).toBe(4);
  });
});
