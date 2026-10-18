import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { exhaustiveGuard } from "@esposter/shared";

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
    case MathExpressionNodeType.List:
      return node.elements;
    case MathExpressionNodeType.Name:
    case MathExpressionNodeType.Number:
      return [];
    default:
      return exhaustiveGuard(node);
  }
};
