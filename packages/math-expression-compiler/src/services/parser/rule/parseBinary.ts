import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { parseBinaryOperators } from "#src/services/parser/parseBinaryOperators";

// Every binary operator, from the loosest: the rule beneath assignment and the conditional
export const parseBinary: MathExpressionRuleParser = (state, parse): MathExpressionNode =>
  parseBinaryOperators(state, parse, 0);
