import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsSignedNumber } from "#src/services/parser/checkIsSignedNumber";

// A constant of the implicit product, which a name or a parenthesis after it does not multiply again: `2 3` is an error
export const checkIsConstantOperand = (node: MathExpressionNode): boolean =>
  checkIsSignedNumber(node) ||
  (node.type === MathExpressionNodeType.Unary &&
    node.name === "bitNot" &&
    node.operand.type === MathExpressionNodeType.Number);
