import { SurveyExpressionBinaryOperatorMap } from "#src/services/SurveyExpressionBinaryOperatorMap";
import { SurveyExpressionPostfixOperatorMap } from "#src/services/SurveyExpressionPostfixOperatorMap";
import { SurveyExpressionPrefixOperatorMap } from "#src/services/SurveyExpressionPrefixOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// A word is a keyword when an operator map spells it, which is the same lookup the parser makes for the token
export const checkIsSurveyExpressionKeyword = (lowercasedWord: string): boolean =>
  getOwnValue(SurveyExpressionBinaryOperatorMap, lowercasedWord) !== undefined ||
  getOwnValue(SurveyExpressionPostfixOperatorMap, lowercasedWord) !== undefined ||
  getOwnValue(SurveyExpressionPrefixOperatorMap, lowercasedWord) !== undefined;
