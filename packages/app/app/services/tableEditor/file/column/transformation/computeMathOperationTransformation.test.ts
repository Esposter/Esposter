import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { MathOperationType } from "#shared/models/tableEditor/file/column/transformation/MathOperationType";
import { computeMathOperationTransformation } from "@/services/tableEditor/file/column/transformation/computeMathOperationTransformation";
import { describe, expect, test } from "vitest";

describe(computeMathOperationTransformation, () => {
  test("multiplies by operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(0.1, {
        operand: 2,
        operation: MathOperationType.Multiply,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBeCloseTo(0.2);
  });

  test("divides by operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(0.1, {
        operand: 2,
        operation: MathOperationType.Divide,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBeCloseTo(0.05);
  });

  test("returns null when dividing by zero", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(1, {
        operand: 0,
        operation: MathOperationType.Divide,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBeNull();
  });

  test("adds operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(0, {
        operand: 1,
        operation: MathOperationType.Add,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBe(1);
  });

  test("subtracts operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(1, {
        operand: 1,
        operation: MathOperationType.Subtract,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBe(0);
  });

  test("rounds to nearest integer", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(0.1, {
        operation: MathOperationType.Round,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBe(0);
  });

  test("floors to integer", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(0.1, {
        operation: MathOperationType.Floor,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBe(0);
  });

  test("ceils to integer", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(0.1, {
        operation: MathOperationType.Ceil,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBe(1);
  });

  test("returns absolute value", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(-1, {
        operation: MathOperationType.Abs,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBe(1);
  });

  test("returns null for non-number value", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation("0", {
        operand: 2,
        operation: MathOperationType.Multiply,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBeNull();
  });

  test("returns null when operand is missing for binary operation", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(1, {
        operation: MathOperationType.Multiply,
        sourceColumnId: "",
        type: ColumnTransformationType.MathOperation,
      }),
    ).toBeNull();
  });
});
