import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { createBinaryNode } from "#src/services/parser/createBinaryNode";
import { parseLeftAssociative } from "#src/services/parser/parseLeftAssociative";

export const parseAdditive: MathExpressionRuleParser = (state, parse): MathExpressionNode =>
  parseLeftAssociative(
    state,
    MathExpressionOperatorMap[MathExpressionGrammarRule.Additive],
    () => parse(state, MathExpressionGrammarRule.Multiplicative),
    createBinaryNode,
  );
