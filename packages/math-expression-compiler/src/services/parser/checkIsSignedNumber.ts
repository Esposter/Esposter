import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionFunctionName } from "#src/models/function/MathExpressionFunctionName";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

export const checkIsSignedNumber = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Number) return true;
  return (
    node.type === MathExpressionNodeType.Unary &&
    (node.name === MathExpressionFunctionName.UnaryMinus || node.name === MathExpressionFunctionName.UnaryPlus) &&
    node.operand.type === MathExpressionNodeType.Number
  );
};
