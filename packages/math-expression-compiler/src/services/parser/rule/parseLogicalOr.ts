import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { createLogicalNode } from "#src/services/parser/createLogicalNode";
import { parseLeftAssociative } from "#src/services/parser/parseLeftAssociative";

export const parseLogicalOr: MathExpressionRuleParser = (state, parse): MathExpressionNode =>
  parseLeftAssociative(
    state,
    MathExpressionOperatorMap[MathExpressionGrammarRule.LogicalOr],
    () => parse(state, MathExpressionGrammarRule.LogicalXor),
    createLogicalNode,
  );
