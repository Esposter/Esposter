import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { parseAdditive } from "#src/services/parser/rule/parseAdditive";
import { parseAssignment } from "#src/services/parser/rule/parseAssignment";
import { parseBitwiseAnd } from "#src/services/parser/rule/parseBitwiseAnd";
import { parseBitwiseOr } from "#src/services/parser/rule/parseBitwiseOr";
import { parseBitwiseXor } from "#src/services/parser/rule/parseBitwiseXor";
import { parseConditional } from "#src/services/parser/rule/parseConditional";
import { parseDivisionBeforeProduct } from "#src/services/parser/rule/parseDivisionBeforeProduct";
import { parseImplicitProduct } from "#src/services/parser/rule/parseImplicitProduct";
import { parseLeftHand } from "#src/services/parser/rule/parseLeftHand";
import { parseLogicalAnd } from "#src/services/parser/rule/parseLogicalAnd";
import { parseLogicalOr } from "#src/services/parser/rule/parseLogicalOr";
import { parseLogicalXor } from "#src/services/parser/rule/parseLogicalXor";
import { parseMultiplicative } from "#src/services/parser/rule/parseMultiplicative";
import { parseNullish } from "#src/services/parser/rule/parseNullish";
import { parsePercentage } from "#src/services/parser/rule/parsePercentage";
import { parsePower } from "#src/services/parser/rule/parsePower";
import { parseRelational } from "#src/services/parser/rule/parseRelational";
import { parseShift } from "#src/services/parser/rule/parseShift";
import { parseSymbol } from "#src/services/parser/rule/parseSymbol";
import { parseUnary } from "#src/services/parser/rule/parseUnary";

// The parser of each grammar rule, keyed by the rule it parses
export const MathExpressionRuleParserMap: Record<MathExpressionGrammarRule, MathExpressionRuleParser> = {
  [MathExpressionGrammarRule.Additive]: parseAdditive,
  [MathExpressionGrammarRule.Assignment]: parseAssignment,
  [MathExpressionGrammarRule.BitwiseAnd]: parseBitwiseAnd,
  [MathExpressionGrammarRule.BitwiseOr]: parseBitwiseOr,
  [MathExpressionGrammarRule.BitwiseXor]: parseBitwiseXor,
  [MathExpressionGrammarRule.Conditional]: parseConditional,
  [MathExpressionGrammarRule.DivisionBeforeProduct]: parseDivisionBeforeProduct,
  [MathExpressionGrammarRule.ImplicitProduct]: parseImplicitProduct,
  [MathExpressionGrammarRule.LeftHand]: parseLeftHand,
  [MathExpressionGrammarRule.LogicalAnd]: parseLogicalAnd,
  [MathExpressionGrammarRule.LogicalOr]: parseLogicalOr,
  [MathExpressionGrammarRule.LogicalXor]: parseLogicalXor,
  [MathExpressionGrammarRule.Multiplicative]: parseMultiplicative,
  [MathExpressionGrammarRule.Nullish]: parseNullish,
  [MathExpressionGrammarRule.Percentage]: parsePercentage,
  [MathExpressionGrammarRule.Power]: parsePower,
  [MathExpressionGrammarRule.Relational]: parseRelational,
  [MathExpressionGrammarRule.Shift]: parseShift,
  [MathExpressionGrammarRule.Symbol]: parseSymbol,
  [MathExpressionGrammarRule.Unary]: parseUnary,
};
