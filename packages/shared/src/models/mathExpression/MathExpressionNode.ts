import type { MathExpressionLogicalOperator } from "#src/models/mathExpression/MathExpressionLogicalOperator";
import type { MathExpressionNodeType } from "#src/models/mathExpression/MathExpressionNodeType";

// A formula's parsed tree. A `name` on a unary, binary, comparison or call node is a key of the function table, so the
// Evaluator computes each operator and each function the same way.
export type MathExpressionNode =
  | { arguments: MathExpressionNode[]; name: string; type: MathExpressionNodeType.Call }
  | {
      condition: MathExpressionNode;
      type: MathExpressionNodeType.Conditional;
      whenFalse: MathExpressionNode;
      whenTrue: MathExpressionNode;
    }
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
