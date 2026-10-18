import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// Comparisons chain: `a < b < c` holds when each adjacent pair does, so the operands are kept in order
export const parseRelational: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const operators = MathExpressionOperatorMap[MathExpressionGrammarRule.Relational];
  const first = parse(state, MathExpressionGrammarRule.Shift);
  const names: string[] = [];
  const operands: MathExpressionNode[] = [first];
  let name = getOwnValue(operators, state.token);
  while (state.error === null && name !== undefined) {
    names.push(name);
    getMathExpressionToken(state);
    operands.push(parse(state, MathExpressionGrammarRule.Shift));
    name = getOwnValue(operators, state.token);
  }
  if (names.length === 0) return first;
  return { names, operands, type: MathExpressionNodeType.Comparison };
};
