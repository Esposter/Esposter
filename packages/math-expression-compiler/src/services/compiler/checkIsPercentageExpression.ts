import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A percentage expression is a percentage, or a sum or difference of percentage expressions
export const checkIsPercentageExpression = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Percentage) return true;
  if (node.type !== MathExpressionNodeType.Binary) return false;
  if (node.name !== "add" && node.name !== "subtract") return false;
  return checkIsPercentageExpression(node.left) && checkIsPercentageExpression(node.right);
};
