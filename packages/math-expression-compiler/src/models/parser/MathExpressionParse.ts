import type { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

// Parses one grammar rule from the state. A rule parser reaches the rules beneath it only through this callback.
// Rules therefore never import each other.
export type MathExpressionParse = (
  state: MathExpressionParserState,
  rule: MathExpressionGrammarRule,
) => MathExpressionNode;
