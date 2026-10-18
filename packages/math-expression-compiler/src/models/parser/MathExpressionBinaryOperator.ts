import type { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A binary operator whose node names a function, so its name is always there to read
export interface MathExpressionBinaryFunctionOperator {
  name: string;
  power: number;
  type: MathExpressionNodeType.Binary;
}

// A binary operator: its binding power, the higher binding tighter, and the node it builds. A binary or a comparison node
// Names a function, and a logical node applies its operator
export type MathExpressionBinaryOperator =
  | MathExpressionBinaryFunctionOperator
  | { name: string; power: number; type: MathExpressionNodeType.Comparison }
  | { operator: MathExpressionLogicalOperator; power: number; type: MathExpressionNodeType.Logical };
