import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { createLogicalNode } from "#src/services/parser/createLogicalNode";
import { parseLeftAssociative } from "#src/services/parser/parseLeftAssociative";

export const parseNullish: MathExpressionRuleParser = (state, parse): MathExpressionNode =>
  parseLeftAssociative(
    state,
    parse,
    MathExpressionOperatorMap[MathExpressionGrammarRule.Nullish],
    MathExpressionGrammarRule.LeftHand,
    createLogicalNode,
  );
