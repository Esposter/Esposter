import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";

import { STRING_QUOTES } from "#src/services/constants";
import { checkIsSurveyExpressionDigit } from "#src/services/tokenizer/checkIsSurveyExpressionDigit";
import { checkIsSurveyExpressionWordStart } from "#src/services/tokenizer/checkIsSurveyExpressionWordStart";
import { readSurveyExpressionNumber } from "#src/services/tokenizer/readSurveyExpressionNumber";
import { readSurveyExpressionReference } from "#src/services/tokenizer/readSurveyExpressionReference";
import { readSurveyExpressionString } from "#src/services/tokenizer/readSurveyExpressionString";
import { readSurveyExpressionSymbol } from "#src/services/tokenizer/readSurveyExpressionSymbol";
import { readSurveyExpressionWord } from "#src/services/tokenizer/readSurveyExpressionWord";

// Reads the token at the cursor, which is never whitespace. A dot starts a number only when a digit follows it, so `.5`
// Is a number and a lone dot is refused
export const readSurveyExpressionToken = (state: SurveyExpressionTokenizerState): void => {
  const character = state.source.charAt(state.index);
  const nextCharacter = state.source.charAt(state.index + 1);
  if (checkIsSurveyExpressionDigit(character) || (character === "." && checkIsSurveyExpressionDigit(nextCharacter)))
    readSurveyExpressionNumber(state);
  else if (STRING_QUOTES.includes(character)) readSurveyExpressionString(state);
  else if (character === "{") readSurveyExpressionReference(state);
  else if (checkIsSurveyExpressionWordStart(character)) readSurveyExpressionWord(state);
  else readSurveyExpressionSymbol(state);
};
