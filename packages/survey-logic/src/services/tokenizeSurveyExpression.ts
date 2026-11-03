import type { SurveyExpressionToken } from "#src/models/SurveyExpressionToken";
import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { advanceSurveyExpressionWhile } from "#src/services/tokenizer/advanceSurveyExpressionWhile";
import { checkIsSurveyExpressionWhitespace } from "#src/services/tokenizer/checkIsSurveyExpressionWhitespace";
import { readSurveyExpressionToken } from "#src/services/tokenizer/readSurveyExpressionToken";
import { err, ok } from "neverthrow";

// Reads the source into its tokens, which end with an end token at the source's length, or returns the first fault
export const tokenizeSurveyExpression = (source: string): Result<SurveyExpressionToken[], SurveyLogicError> => {
  const state: SurveyExpressionTokenizerState = { error: null, index: 0, source, tokens: [] };
  advanceSurveyExpressionWhile(state, checkIsSurveyExpressionWhitespace);
  while (state.error === null && state.index < source.length) {
    readSurveyExpressionToken(state);
    advanceSurveyExpressionWhile(state, checkIsSurveyExpressionWhitespace);
  }
  if (state.error !== null) return err(state.error);

  state.tokens.push({ position: source.length, text: "", type: SurveyExpressionTokenType.End });
  return ok(state.tokens);
};
