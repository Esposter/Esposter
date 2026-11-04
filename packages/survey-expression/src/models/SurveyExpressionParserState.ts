import type { SurveyExpressionToken } from "#src/models/SurveyExpressionToken";

// The parser's cursor over the tokens. The last token is always the end token, so a read never runs past the list
export interface SurveyExpressionParserState {
  index: number;
  tokens: SurveyExpressionToken[];
}
