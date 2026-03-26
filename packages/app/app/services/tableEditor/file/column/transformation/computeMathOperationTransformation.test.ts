import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperand";

import { BinaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { UnaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/UnaryMathOperationType";
import { computeMathOperationTransformation } from "@/services/tableEditor/file/column/transformation/computeMathOperationTransformation";
import { describe, expect, test } from "vitest";

describe(computeMathOperationTransformation, () => {
  const constantOperand = (value: number): MathOperand => ({ type: MathOperandType.Constant, value });

  test("returns first operand with no steps", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        { first: constantOperand(0), steps: [], type: ColumnTransformationType.MathOperation },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(0);
  });

  test("multiplies by constant operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(0.1),
          steps: [
            { operand: constantOperand(2), operation: BinaryMathOperationType.Multiply, type: MathStepType.Binary },
          ],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBeCloseTo(0.2);
  });

  test("divides by constant operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(0.1),
          steps: [
            { operand: constantOperand(2), operation: BinaryMathOperationType.Divide, type: MathStepType.Binary },
          ],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBeCloseTo(0.05);
  });

  test("returns null when dividing by zero", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(1),
          steps: [
            { operand: constantOperand(0), operation: BinaryMathOperationType.Divide, type: MathStepType.Binary },
          ],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBeNull();
  });

  test("adds constant operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(0),
          steps: [{ operand: constantOperand(1), operation: BinaryMathOperationType.Add, type: MathStepType.Binary }],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(1);
  });

  test("subtracts constant operand", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(1),
          steps: [
            { operand: constantOperand(1), operation: BinaryMathOperationType.Subtract, type: MathStepType.Binary },
          ],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(0);
  });

  test("rounds to nearest integer", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(0.1),
          steps: [{ operation: UnaryMathOperationType.Round, type: MathStepType.Unary }],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(0);
  });

  test("floors to integer", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(0.1),
          steps: [{ operation: UnaryMathOperationType.Floor, type: MathStepType.Unary }],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(0);
  });

  test("ceils to integer", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(0.1),
          steps: [{ operation: UnaryMathOperationType.Ceil, type: MathStepType.Unary }],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(1);
  });

  test("returns absolute value", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(-1),
          steps: [{ operation: UnaryMathOperationType.Absolute, type: MathStepType.Unary }],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(1);
  });

  test("returns null when first operand resolves to non-number before binary step", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: { sourceColumnId: "", type: MathOperandType.Column },
          steps: [
            { operand: constantOperand(2), operation: BinaryMathOperationType.Multiply, type: MathStepType.Binary },
          ],
          type: ColumnTransformationType.MathOperation,
        },
        () => null,
      ),
    ).toBeNull();
  });

  test("composes multiple steps: multiply then add", () => {
    expect.hasAssertions();
    expect(
      computeMathOperationTransformation(
        {
          first: constantOperand(2),
          steps: [
            { operand: constantOperand(3), operation: BinaryMathOperationType.Multiply, type: MathStepType.Binary },
            { operand: constantOperand(1), operation: BinaryMathOperationType.Add, type: MathStepType.Binary },
          ],
          type: ColumnTransformationType.MathOperation,
        },
        (operand) => (operand.type === MathOperandType.Constant ? operand.value : null),
      ),
    ).toBe(7);
  });
});
