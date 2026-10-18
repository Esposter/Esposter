import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { createBinaryNode } from "#src/services/parser/createBinaryNode";
import { parseLeftAssociative } from "#src/services/parser/parseLeftAssociative";

export const parseBitwiseAnd: MathExpressionRuleParser = (state, parse): MathExpressionNode =>
  parseLeftAssociative(
    state,
    parse,
    MathExpressionOperatorMap[MathExpressionGrammarRule.BitwiseAnd],
    MathExpressionGrammarRule.Relational,
    createBinaryNode,
  );
