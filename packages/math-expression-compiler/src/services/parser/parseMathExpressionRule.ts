import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import type { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionRuleParserMap } from "#src/services/parser/MathExpressionRuleParserMap";

// Parses one grammar rule from the state, the entry every rule parses its operands through
export const parseMathExpressionRule = (
  state: MathExpressionParserState,
  rule: MathExpressionGrammarRule,
): MathExpressionNode => MathExpressionRuleParserMap[rule](state, parseMathExpressionRule);
