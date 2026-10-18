import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { createBinaryNode } from "#src/services/parser/createBinaryNode";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// A power is right associative, and its exponent is a unary operand, so `2^-3^2` is `2^(-(3^2))`
export const parsePower: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const base = parse(state, MathExpressionGrammarRule.Nullish);
  const name = getOwnValue(MathExpressionOperatorMap[MathExpressionGrammarRule.Power], state.token);
  if (state.error !== null || name === undefined) return base;

  getMathExpressionToken(state);
  const exponent = parse(state, MathExpressionGrammarRule.Unary);
  return createBinaryNode(base, name, exponent);
};
