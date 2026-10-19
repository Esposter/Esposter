import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionFunctionName } from "#src/models/function/MathExpressionFunctionName";
import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// A symbol with its postfix factorials and transposes, applied left to right
export const parseLeftHand: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  let node = parse(state, MathExpressionGrammarRule.Symbol);
  while (state.error === null && (checkIsToken(state, "!") || checkIsToken(state, "'"))) {
    const name = checkIsToken(state, "!")
      ? MathExpressionFunctionName.Factorial
      : MathExpressionFunctionName.CTranspose;
    getMathExpressionToken(state);
    node = { name, operand: node, type: MathExpressionNodeType.Unary };
  }
  return node;
};
