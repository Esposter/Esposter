import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { checkIsSignedNumber } from "#src/services/parser/checkIsSignedNumber";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { createBinaryNode } from "#src/services/parser/createBinaryNode";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// A division of one signed number by another, followed by a name or a parenthesis, is taken first, so `1/2 col0` is
// `(1/2) * col0`, as mathjs reads it
export const parseDivisionBeforeProduct: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const dividend = parse(state, MathExpressionGrammarRule.Percentage);
  if (state.error !== null || !checkIsToken(state, "/") || !checkIsSignedNumber(dividend)) return dividend;

  const snapshot = { ...state };
  getMathExpressionToken(state);
  // Mathjs takes only an unsigned divisor into the exception, since a signed one binds to the name after it:
  // So 1/-2 col0 is 1/-6
  const isNumber = state.tokenType === MathExpressionTokenType.Number;
  if (isNumber) getMathExpressionToken(state);
  const isProductFactor =
    isNumber &&
    state.error === null &&
    (state.tokenType === MathExpressionTokenType.Symbol || checkIsToken(state, "("));
  if (isProductFactor) {
    Object.assign(state, snapshot);
    getMathExpressionToken(state);
    return createBinaryNode(dividend, "divide", parse(state, MathExpressionGrammarRule.Percentage));
  }

  Object.assign(state, snapshot);
  return dividend;
};
