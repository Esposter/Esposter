import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkCanMathExpressionNest } from "#src/services/parser/checkCanMathExpressionNest";
import { PLACEHOLDER } from "#src/services/parser/constants";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";

// A prefix operator applies to the unary operand after it, and a formula without one is a power
export const parseUnary: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const name = getOwnValue(MathExpressionOperatorMap[MathExpressionGrammarRule.Unary], state.token);
  if (name === undefined) return parse(state, MathExpressionGrammarRule.Power);
  if (!checkCanMathExpressionNest(state)) return PLACEHOLDER;

  getMathExpressionToken(state);
  state.depth++;
  const operand = parse(state, MathExpressionGrammarRule.Unary);
  state.depth--;
  return { name, operand, type: MathExpressionNodeType.Unary };
};
