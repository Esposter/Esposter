import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { UNARY_MINUS_NAME, UNARY_PLUS_NAME } from "#src/services/parser/constants";

export const checkIsSignedNumber = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Number) return true;
  return (
    node.type === MathExpressionNodeType.Unary &&
    (node.name === UNARY_MINUS_NAME || node.name === UNARY_PLUS_NAME) &&
    node.operand.type === MathExpressionNodeType.Number
  );
};
