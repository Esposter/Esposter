import type { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A formula's parsed tree. A `name` on a unary, binary or call node, and each of a comparison's `names`, is a key of the
// Function table, so the evaluator computes each operator and each function the same way.
export type MathExpressionNode =
  | { arguments: MathExpressionNode[]; name: string; type: typeof MathExpressionNodeType.Call }
  | {
      condition: MathExpressionNode;
      type: typeof MathExpressionNodeType.Conditional;
      whenFalse: MathExpressionNode;
      whenTrue: MathExpressionNode;
    }
  | { elements: MathExpressionNode[]; type: typeof MathExpressionNodeType.List }
  | { left: MathExpressionNode; name: string; right: MathExpressionNode; type: typeof MathExpressionNodeType.Binary }
  | {
      left: MathExpressionNode;
      operator: MathExpressionLogicalOperator;
      right: MathExpressionNode;
      type: typeof MathExpressionNodeType.Logical;
    }
  | { name: string; operand: MathExpressionNode; type: typeof MathExpressionNodeType.Unary }
  | { name: string; type: typeof MathExpressionNodeType.Assignment; value: MathExpressionNode }
  | { name: string; type: typeof MathExpressionNodeType.Name }
  | { names: string[]; operands: MathExpressionNode[]; type: typeof MathExpressionNodeType.Comparison }
  | { operand: MathExpressionNode; type: typeof MathExpressionNodeType.Group }
  | { operand: MathExpressionNode; type: typeof MathExpressionNodeType.Percentage }
  | { type: typeof MathExpressionNodeType.Number; value: number };
