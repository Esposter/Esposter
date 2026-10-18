import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { MathExpressionBitwiseAbsorptionMap } from "#src/services/compiler/MathExpressionBitwiseAbsorptionMap";
import { getMathExpressionChildren } from "#src/services/shared/getMathExpressionChildren";
import { exhaustiveGuard } from "@esposter/shared";

// Walks a node in the order the formula evaluates it. Bound holds the names every path to this point has assigned.
// Free collects the names read before one of those paths assigned them, in reading order
export const walkNode = (node: MathExpressionNode, bound: Set<string>, free: Set<string>): void => {
  switch (node.type) {
    case MathExpressionNodeType.Assignment:
      walkNode(node.value, bound, free);
      bound.add(node.name);
      return;
    case MathExpressionNodeType.Binary: {
      walkNode(node.left, bound, free);
      const rightBound = Object.hasOwn(MathExpressionBitwiseAbsorptionMap, node.name) ? new Set(bound) : bound;
      walkNode(node.right, rightBound, free);
      return;
    }
    case MathExpressionNodeType.Call:
    case MathExpressionNodeType.Group:
    case MathExpressionNodeType.List:
    case MathExpressionNodeType.Number:
    case MathExpressionNodeType.Percentage:
    case MathExpressionNodeType.Unary:
      for (const child of getMathExpressionChildren(node)) walkNode(child, bound, free);
      return;
    case MathExpressionNodeType.Comparison: {
      // A chain always reads its first pair, and each operand after it only while every pair before it holds
      let chainBound = bound;
      for (const [index, operand] of node.operands.entries()) {
        if (index === 2) chainBound = new Set(bound);
        walkNode(operand, chainBound, free);
      }
      return;
    }
    case MathExpressionNodeType.Conditional: {
      walkNode(node.condition, bound, free);
      const whenTrueBound = new Set(bound);
      const whenFalseBound = new Set(bound);
      walkNode(node.whenTrue, whenTrueBound, free);
      walkNode(node.whenFalse, whenFalseBound, free);
      for (const name of whenTrueBound) if (whenFalseBound.has(name)) bound.add(name);
      return;
    }
    case MathExpressionNodeType.Logical:
      walkNode(node.left, bound, free);
      walkNode(node.right, new Set(bound), free);
      return;
    case MathExpressionNodeType.Name:
      if (!bound.has(node.name)) free.add(node.name);
      return;
    default:
      return exhaustiveGuard(node);
  }
};
