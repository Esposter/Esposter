import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { advanceSurveyExpressionWhile } from "#src/services/tokenizer/advanceSurveyExpressionWhile";
import { checkIsSurveyExpressionKeyword } from "#src/services/tokenizer/checkIsSurveyExpressionKeyword";
import { checkIsSurveyExpressionWordCharacter } from "#src/services/tokenizer/checkIsSurveyExpressionWordCharacter";

// Keywords read in any case, so a keyword's text is lowercased, and `true` and `false` are literals rather than names
export const readSurveyExpressionWord = (state: SurveyExpressionTokenizerState): void => {
  const start = state.index;
  advanceSurveyExpressionWhile(state, checkIsSurveyExpressionWordCharacter);
  const word = state.source.slice(start, state.index);
  const lowercasedWord = word.toLowerCase();
  if (["true", "false"].includes(lowercasedWord))
    state.tokens.push({ position: start, text: lowercasedWord, type: SurveyExpressionTokenType.Boolean });
  else if (checkIsSurveyExpressionKeyword(lowercasedWord))
    state.tokens.push({ position: start, text: lowercasedWord, type: SurveyExpressionTokenType.Operator });
  else state.tokens.push({ position: start, text: word, type: SurveyExpressionTokenType.Identifier });
};
