import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import type { MathOperationTransformation } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";

import { BinaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { UnaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/UnaryMathOperationType";
import { exhaustiveGuard } from "@esposter/shared";

export const computeMathOperationTransformation = (
  transformation: MathOperationTransformation,
  resolveOperand: (operand: MathOperand) => ColumnValue,
): ColumnValue => {
  let result = resolveOperand(transformation.first);
  for (const step of transformation.steps) {
    if (typeof result !== "number") return null;
    switch (step.type) {
      case MathStepType.Unary:
        switch (step.operation) {
          case UnaryMathOperationType.Absolute:
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
          default:
            exhaustiveGuard(step.operation);
        }
        break;
      case MathStepType.Binary: {
        const right = resolveOperand(step.operand);
        if (typeof right !== "number") return null;
        switch (step.operation) {
          case BinaryMathOperationType.Add:
            result += right;
            break;
          case BinaryMathOperationType.Divide:
            if (right === 0) return null;
            result /= right;
            break;
          case BinaryMathOperationType.Multiply:
            result *= right;
            break;
          case BinaryMathOperationType.Subtract:
            result -= right;
            break;
          default:
            exhaustiveGuard(step.operation);
        }
        break;
      }
      default:
        exhaustiveGuard(step.type);
    }
  }
  return result;
};
