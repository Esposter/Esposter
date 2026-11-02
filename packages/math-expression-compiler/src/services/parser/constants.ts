import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// The deepest parentheses, unary operators, assignments, powers or conditionals a formula may nest, so a typed formula
// Cannot exhaust the stack
export const MAX_MATH_EXPRESSION_DEPTH = 64;
// The node a failed parse stands in for, so the parser can return from a level it cannot finish
export const PLACEHOLDER: MathExpressionNode = { type: MathExpressionNodeType.Number, value: Number.NaN };
