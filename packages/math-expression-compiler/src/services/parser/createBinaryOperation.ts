import type { MathExpressionBinaryOperator } from "#src/models/parser/MathExpressionBinaryOperator";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { createBinaryNode } from "#src/services/parser/createBinaryNode";
import { createLogicalNode } from "#src/services/parser/createLogicalNode";

// Builds the node an operator names from its two operands. A comparison extends the one before it when that is a comparison,
// So `a < b < c` is one node: the left operand is always one the binary loop built, never a parenthesised group
export const createBinaryOperation = (
  left: MathExpressionNode,
  operator: MathExpressionBinaryOperator,
  right: MathExpressionNode,
): MathExpressionNode => {
  if (operator.type === MathExpressionNodeType.Logical) return createLogicalNode(left, operator.operator, right);
  if (operator.type === MathExpressionNodeType.Binary) return createBinaryNode(left, operator.name, right);
  if (left.type === MathExpressionNodeType.Comparison) {
    left.names.push(operator.name);
    left.operands.push(right);
    return left;
  }

  return { names: [operator.name], operands: [left, right], type: MathExpressionNodeType.Comparison };
};
