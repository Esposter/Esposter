import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { MathOperationTransformation } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";

import { MathOperationType } from "#shared/models/tableEditor/file/column/transformation/MathOperationType";

export const computeMathOperationTransformation = (
  value: ColumnValue,
  transformation: MathOperationTransformation,
): ColumnValue => {
  if (typeof value !== "number") return null;
  const { operand } = transformation;
  switch (transformation.operation) {
    case MathOperationType.Abs:
      return Math.abs(value);
    case MathOperationType.Add:
      return operand === undefined ? null : value + operand;
    case MathOperationType.Ceil:
      return Math.ceil(value);
    case MathOperationType.Divide:
      return operand === undefined || operand === 0 ? null : value / operand;
    case MathOperationType.Floor:
      return Math.floor(value);
    case MathOperationType.Multiply:
      return operand === undefined ? null : value * operand;
    case MathOperationType.Round:
      return Math.round(value);
    case MathOperationType.Subtract:
      return operand === undefined ? null : value - operand;
  }
};
