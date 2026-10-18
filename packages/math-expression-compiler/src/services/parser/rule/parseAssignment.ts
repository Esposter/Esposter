import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkCanMathExpressionNest } from "#src/services/parser/checkCanMathExpressionNest";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { PLACEHOLDER } from "#src/services/parser/constants";
import { failMathExpression } from "#src/services/parser/failMathExpression";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// An assignment binds a plain name, and the value on its right is an assignment in turn
export const parseAssignment: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  if (!checkCanMathExpressionNest(state)) return PLACEHOLDER;

  state.depth++;
  const left = parse(state, MathExpressionGrammarRule.Conditional);
  let node = left;
  if (state.error === null && checkIsToken(state, "="))
    if (left.type === MathExpressionNodeType.Name) {
      getMathExpressionToken(state);
      const value = parse(state, MathExpressionGrammarRule.Assignment);
      node = { name: left.name, type: MathExpressionNodeType.Assignment, value };
    } else failMathExpression(state, "Invalid left hand side of assignment operator =");

  state.depth--;
  return node;
};
