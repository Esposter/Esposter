import type { MathExpressionLogicalOperator } from "#src/models/MathExpressionLogicalOperator";
import type { MathExpressionNodeType } from "#src/models/MathExpressionNodeType";

// A formula's parsed tree. A `name` on a unary, binary or call node, and each of a comparison's `names`, is a key of the
// Function table, so the evaluator computes each operator and each function the same way.
export type MathExpressionNode =
  | { arguments: MathExpressionNode[]; name: string; type: MathExpressionNodeType.Call }
  | {
      condition: MathExpressionNode;
      type: MathExpressionNodeType.Conditional;
      whenFalse: MathExpressionNode;
      whenTrue: MathExpressionNode;
    }
  | { elements: MathExpressionNode[]; type: MathExpressionNodeType.List }
  | { left: MathExpressionNode; name: string; right: MathExpressionNode; type: MathExpressionNodeType.Binary }
  | {
      left: MathExpressionNode;
      operator: MathExpressionLogicalOperator;
      right: MathExpressionNode;
      type: MathExpressionNodeType.Logical;
    }
  | { name: string; operand: MathExpressionNode; type: MathExpressionNodeType.Unary }
  | { name: string; type: MathExpressionNodeType.Assignment; value: MathExpressionNode }
  | { name: string; type: MathExpressionNodeType.Name }
  | { names: string[]; operands: MathExpressionNode[]; type: MathExpressionNodeType.Comparison }
  | { operand: MathExpressionNode; type: MathExpressionNodeType.Group }
  | { operand: MathExpressionNode; type: MathExpressionNodeType.Percentage }
  | { type: MathExpressionNodeType.Number; value: number };
