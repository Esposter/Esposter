import type { MathExpressionError } from "#src/models/shared/MathExpressionError";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { Result } from "neverthrow";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { failMathExpression } from "#src/services/parser/failMathExpression";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { parseMathExpressionRule } from "#src/services/parser/parseMathExpressionRule";
import { err, ok } from "neverthrow";

// Parses a whole formula into its tree, or returns the first error it meets, positioned as mathjs positions it
export const parseMathExpression = (formula: string): Result<MathExpressionNode, MathExpressionError> => {
  const state: MathExpressionParserState = {
    depth: 0,
    error: null,
    index: 0,
    nestingLevel: 0,
    source: formula,
    token: "",
    tokenType: MathExpressionTokenType.Null,
  };
  getMathExpressionToken(state);
  const node = parseMathExpressionRule(state, MathExpressionGrammarRule.Assignment);
  if (state.error === null && !checkIsToken(state, ""))
    failMathExpression(
      state,
      state.tokenType === MathExpressionTokenType.Delimiter
        ? `Unexpected operator ${state.token}`
        : `Unexpected part "${state.token}"`,
    );

  return state.error === null ? ok(node) : err(state.error);
};
