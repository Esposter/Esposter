import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionFunctionName } from "#src/models/function/MathExpressionFunctionName";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// The operators that a number cannot follow in an implicit product, where a factorial is still an operand
export const checkIsOperatorOperand = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Unary) return node.name !== MathExpressionFunctionName.Factorial;
  return (
    node.type === MathExpressionNodeType.Binary ||
    node.type === MathExpressionNodeType.Comparison ||
    node.type === MathExpressionNodeType.Logical
  );
};
