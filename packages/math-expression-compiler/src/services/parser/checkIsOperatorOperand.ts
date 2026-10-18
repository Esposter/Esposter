import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { FACTORIAL_NAME } from "#src/services/parser/constants";

// The operators that a number cannot follow in an implicit product, where a factorial is still an operand
export const checkIsOperatorOperand = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Unary) return node.name !== FACTORIAL_NAME;
  return (
    node.type === MathExpressionNodeType.Binary ||
    node.type === MathExpressionNodeType.Comparison ||
    node.type === MathExpressionNodeType.Logical
  );
};
