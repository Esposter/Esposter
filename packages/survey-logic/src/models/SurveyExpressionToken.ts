import type { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";

// A token's text is its value: a string's unescaped contents, a reference's name, a keyword's text lowercased
export interface SurveyExpressionToken {
  position: number;
  text: string;
  type: SurveyExpressionTokenType;
}
