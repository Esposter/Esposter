import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

export const checkIsSignedNumber = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Number) return true;
  return (
    node.type === MathExpressionNodeType.Unary &&
    (node.name === "unaryMinus" || node.name === "unaryPlus") &&
    node.operand.type === MathExpressionNodeType.Number
  );
};
