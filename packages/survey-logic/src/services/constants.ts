import { SurveyExpressionBinaryOperatorMap } from "#src/services/SurveyExpressionBinaryOperatorMap";
import { SurveyExpressionPrefixOperatorMap } from "#src/services/SurveyExpressionPrefixOperatorMap";
import { checkIsSurveyExpressionWordStart } from "#src/services/tokenizer/checkIsSurveyExpressionWordStart";

// Below every operator's power, so parsing at this power takes the whole expression
export const LOWEST_POWER = 0;
export const PUNCTUATION_CHARACTERS: readonly string[] = ["(", ")", "[", "]", ","];
export const STRING_QUOTES: readonly string[] = ["'", '"'];
// Derived from the operator maps, so the tokenizer reads no symbol the parser cannot place. Longest first, so `<=` is
// Read as one operator and never as `<` then `=`
export const SYMBOL_OPERATOR_TEXTS: string[] = [
  ...Object.keys(SurveyExpressionBinaryOperatorMap),
  ...Object.keys(SurveyExpressionPrefixOperatorMap),
]
  .filter((operatorText) => !checkIsSurveyExpressionWordStart(operatorText.charAt(0)))
  .toSorted((firstText, secondText) => secondText.length - firstText.length);
