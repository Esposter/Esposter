import type { MathExpressionError } from "#src/models/MathExpressionError";
import type { MathExpressionTokenType } from "#src/models/MathExpressionTokenType";

// The tokenizer's and parser's cursor over a formula. The first error met is kept in `error`, and every reader stops
// At it, so a parse returns the error rather than throwing one
export interface MathExpressionParserState {
  depth: number;
  error: MathExpressionError | null;
  index: number;
  nestingLevel: number;
  source: string;
  token: string;
  tokenType: MathExpressionTokenType;
}
