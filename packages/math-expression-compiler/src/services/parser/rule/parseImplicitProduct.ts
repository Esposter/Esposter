import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsConstantOperand } from "#src/services/parser/checkIsConstantOperand";
import { checkIsOperatorOperand } from "#src/services/parser/checkIsOperatorOperand";
import { checkIsToken } from "#src/services/parser/checkIsToken";

// Operands written side by side multiply, unless a constant or an operator stands before a number
export const parseImplicitProduct: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  let node = parse(state, MathExpressionGrammarRule.DivisionBeforeProduct);
  let last = node;
  while (state.error === null) {
    const isFactorStart =
      state.tokenType === MathExpressionTokenType.Symbol ||
      checkIsToken(state, "(") ||
      (state.tokenType === MathExpressionTokenType.Number &&
        !checkIsConstantOperand(last) &&
        !checkIsOperatorOperand(last));
    if (!isFactorStart) break;

    last = parse(state, MathExpressionGrammarRule.DivisionBeforeProduct);
    node = { left: node, name: "multiply", right: last, type: MathExpressionNodeType.Binary };
  }
  return node;
};
