import type { SurveyExpressionToken } from "#src/models/SurveyExpressionToken";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";

// A punctuation mark is told apart by its type as well as its text, so a string holding a bracket is never one
export const checkIsPunctuation = (token: SurveyExpressionToken, text: string): boolean =>
  token.type === SurveyExpressionTokenType.Punctuation && token.text === text;
