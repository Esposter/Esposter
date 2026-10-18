import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

// Reads the token as the state's own string, so a comparison is never against a literal the state narrowed earlier.
// TypeScript keeps a narrowing of a property across the calls that advance the tokenizer (microsoft/TypeScript#9998).
export const checkIsToken = (state: MathExpressionParserState, token: string): boolean => state.token === token;
