import type { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A logical node applies its operator, which reads its right operand only when the left one does not decide it
export const createLogicalNode = (
  left: MathExpressionNode,
  operator: MathExpressionLogicalOperator,
  right: MathExpressionNode,
): MathExpressionNode => ({ left, operator, right, type: MathExpressionNodeType.Logical });
