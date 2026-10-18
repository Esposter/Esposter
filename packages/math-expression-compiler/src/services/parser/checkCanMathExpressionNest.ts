import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MAX_MATH_EXPRESSION_DEPTH } from "#src/services/parser/constants";
import { failMathExpression } from "#src/services/parser/failMathExpression";

export const checkCanMathExpressionNest = (state: MathExpressionParserState): boolean => {
  if (state.depth < MAX_MATH_EXPRESSION_DEPTH) return true;

  failMathExpression(state, `Formula nests deeper than ${MAX_MATH_EXPRESSION_DEPTH} levels`);
  return false;
};
