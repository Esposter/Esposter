import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsOperatorOperand } from "#src/services/parser/checkIsOperatorOperand";
import { checkIsToken } from "#src/services/parser/checkIsToken";

// Whether the token begins a factor that multiplies the operand before it: a name, a parenthesis, or a number after an
// Operand that is neither a number nor an operator. A percentage takes no factor after it, so `5 % 2` is an error
export const checkIsFactorStart = (state: MathExpressionParserState, last: MathExpressionNode): boolean => {
  if (last.type === MathExpressionNodeType.Percentage) return false;
  if (state.tokenType === MathExpressionTokenType.Symbol || checkIsToken(state, "(")) return true;

  return (
    state.tokenType === MathExpressionTokenType.Number &&
    last.type !== MathExpressionNodeType.Number &&
    !checkIsOperatorOperand(last)
  );
};
