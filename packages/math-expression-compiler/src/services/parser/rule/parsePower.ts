import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { checkCanMathExpressionNest } from "#src/services/parser/checkCanMathExpressionNest";
import { PLACEHOLDER } from "#src/services/parser/constants";
import { createBinaryNode } from "#src/services/parser/createBinaryNode";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// A power is right associative, and its exponent is a unary operand, so `2^-3^2` is `2^(-(3^2))`. Each power nests its
// Exponent one level, so a long chain is refused at the depth limit rather than exhausting the stack
export const parsePower: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const base = parse(state, MathExpressionGrammarRule.Nullish);
  const name = getOwnValue(MathExpressionOperatorMap[MathExpressionGrammarRule.Power], state.token);
  if (state.error !== null || name === undefined) return base;
  if (!checkCanMathExpressionNest(state)) return PLACEHOLDER;

  getMathExpressionToken(state);
  state.depth++;
  const exponent = parse(state, MathExpressionGrammarRule.Unary);
  state.depth--;
  return createBinaryNode(base, name, exponent);
};
