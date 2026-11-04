import type { SurveyExpressionToken } from "#src/models/SurveyExpressionToken";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";

// The tokenizer's cursor over the source. The first fault is kept in `error` and every reader stops at it, so the
// Tokenizer returns the fault rather than throwing it
export interface SurveyExpressionTokenizerState {
  error?: SurveyLogicError;
  index: number;
  source: string;
  tokens: SurveyExpressionToken[];
}
