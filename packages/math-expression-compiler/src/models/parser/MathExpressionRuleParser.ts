import type { MathExpressionParse } from "#src/models/parser/MathExpressionParse";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

// Parses one grammar rule from the state. A rule reaches any other rule only through `parse`, so no two rules import
// Each other
export type MathExpressionRuleParser = (
  state: MathExpressionParserState,
  parse: MathExpressionParse,
) => MathExpressionNode;
