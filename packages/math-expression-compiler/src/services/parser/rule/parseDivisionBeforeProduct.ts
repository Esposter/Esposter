import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsSignedNumber } from "#src/services/parser/checkIsSignedNumber";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { restoreMathExpressionParserState } from "#src/services/parser/restoreMathExpressionParserState";

// A division of one signed number by another, followed by a name or a parenthesis, is taken first, so `1/2 col0` is
// `(1/2) * col0`, as mathjs reads it
export const parseDivisionBeforeProduct: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const dividend = parse(state, MathExpressionGrammarRule.Percentage);
  if (state.error !== null || !checkIsToken(state, "/") || !checkIsSignedNumber(dividend)) return dividend;

  const snapshot = { ...state };
  getMathExpressionToken(state);
  const divisor = parse(state, MathExpressionGrammarRule.Percentage);
  // Mathjs takes only an unsigned divisor into the exception: a signed one binds to the name after it, so 1/-2 col0 is 1/-6
  const isProductFactor =
    state.error === null &&
    divisor.type === MathExpressionNodeType.Number &&
    (state.tokenType === MathExpressionTokenType.Symbol || checkIsToken(state, "("));
  if (isProductFactor) return { left: dividend, name: "divide", right: divisor, type: MathExpressionNodeType.Binary };

  restoreMathExpressionParserState(state, snapshot);
  return dividend;
};
