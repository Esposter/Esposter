import type { MathExpressionNode } from "#src/models/mathExpression/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/mathExpression/MathExpressionNodeType";
import { exhaustiveGuard } from "#src/util/validation/exhaustiveGuard";

export const getMathExpressionChildren = (node: MathExpressionNode): MathExpressionNode[] => {
  switch (node.type) {
    case MathExpressionNodeType.Assignment:
      return [node.value];
    case MathExpressionNodeType.Binary:
    case MathExpressionNodeType.Logical:
      return [node.left, node.right];
    case MathExpressionNodeType.Call:
      return node.arguments;
    case MathExpressionNodeType.Comparison:
      return node.operands;
    case MathExpressionNodeType.Conditional:
      return [node.condition, node.whenTrue, node.whenFalse];
    case MathExpressionNodeType.Group:
    case MathExpressionNodeType.Percentage:
    case MathExpressionNodeType.Unary:
      return [node.operand];
    case MathExpressionNodeType.Name:
    case MathExpressionNodeType.Number:
      return [];
    default:
      return exhaustiveGuard(node);
  }
};
