import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A constant of the implicit product, which a name or a parenthesis after it does not multiply again: `2 3` is an error
export const checkIsConstantOperand = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Number) return true;
  return (
    node.type === MathExpressionNodeType.Unary &&
    (node.name === "unaryMinus" || node.name === "unaryPlus" || node.name === "bitNot") &&
    node.operand.type === MathExpressionNodeType.Number
  );
};
