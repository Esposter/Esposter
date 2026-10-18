import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A binary node applies its named function to its two operands
export const createBinaryNode = (
  left: MathExpressionNode,
  name: string,
  right: MathExpressionNode,
): MathExpressionNode => ({ left, name, right, type: MathExpressionNodeType.Binary });
