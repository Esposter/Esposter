import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type {
  MathOperand,
  MathOperationTransformation,
} from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";

import { BinaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { UnaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/UnaryMathOperationType";

export const computeMathOperationTransformation = (
  transformation: MathOperationTransformation,
  resolveOperand: (operand: MathOperand) => ColumnValue,
): ColumnValue => {
  let result = resolveOperand(transformation.first);
  for (const step of transformation.steps) {
    if (typeof result !== "number") return null;
    if (step.type === MathStepType.Unary) {
      switch (step.operation) {
        case UnaryMathOperationType.Abs:
          result = Math.abs(result);
          break;
        case UnaryMathOperationType.Ceil:
          result = Math.ceil(result);
          break;
        case UnaryMathOperationType.Floor:
          result = Math.floor(result);
          break;
        case UnaryMathOperationType.Round:
          result = Math.round(result);
          break;
      }
    } else {
      const right = resolveOperand(step.operand);
      if (typeof right !== "number") return null;
      switch (step.operation) {
        case BinaryMathOperationType.Add:
          result = result + right;
          break;
        case BinaryMathOperationType.Divide:
          if (right === 0) return null;
          result = result / right;
          break;
        case BinaryMathOperationType.Multiply:
          result = result * right;
          break;
        case BinaryMathOperationType.Subtract:
          result = result - right;
          break;
      }
    }
  }
  return result;
};
