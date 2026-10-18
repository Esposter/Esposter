import type { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

// Parses one grammar rule from the state. A rule parser is handed this callback to reach the rules beneath it, so no
// Two rule parsers import each other
export type MathExpressionParse = (
  state: MathExpressionParserState,
  rule: MathExpressionGrammarRule,
) => MathExpressionNode;
