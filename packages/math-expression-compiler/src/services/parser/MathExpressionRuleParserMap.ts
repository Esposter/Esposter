import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { parseAssignment } from "#src/services/parser/rule/parseAssignment";
import { parseBinary } from "#src/services/parser/rule/parseBinary";
import { parseConditional } from "#src/services/parser/rule/parseConditional";
import { parseDivisionBeforeProduct } from "#src/services/parser/rule/parseDivisionBeforeProduct";
import { parseImplicitProduct } from "#src/services/parser/rule/parseImplicitProduct";
import { parseLeftHand } from "#src/services/parser/rule/parseLeftHand";
import { parseNullish } from "#src/services/parser/rule/parseNullish";
import { parsePercentage } from "#src/services/parser/rule/parsePercentage";
import { parsePower } from "#src/services/parser/rule/parsePower";
import { parseSymbol } from "#src/services/parser/rule/parseSymbol";
import { parseUnary } from "#src/services/parser/rule/parseUnary";

// The parser of each grammar rule, keyed by the rule it parses
export const MathExpressionRuleParserMap: Record<MathExpressionGrammarRule, MathExpressionRuleParser> = {
  [MathExpressionGrammarRule.Assignment]: parseAssignment,
  [MathExpressionGrammarRule.Binary]: parseBinary,
  [MathExpressionGrammarRule.Conditional]: parseConditional,
  [MathExpressionGrammarRule.DivisionBeforeProduct]: parseDivisionBeforeProduct,
  [MathExpressionGrammarRule.ImplicitProduct]: parseImplicitProduct,
  [MathExpressionGrammarRule.LeftHand]: parseLeftHand,
  [MathExpressionGrammarRule.Nullish]: parseNullish,
  [MathExpressionGrammarRule.Percentage]: parsePercentage,
  [MathExpressionGrammarRule.Power]: parsePower,
  [MathExpressionGrammarRule.Symbol]: parseSymbol,
  [MathExpressionGrammarRule.Unary]: parseUnary,
};
