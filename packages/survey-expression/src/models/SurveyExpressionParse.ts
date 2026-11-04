import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

// Parses the expression at the cursor, taking the binary operators that bind at least as tightly as the minimum power.
// The parse functions reach one another through this callback, never by import, so no two of them import each other
export type SurveyExpressionParse = (
  state: SurveyExpressionParserState,
  minimumPower: number,
) => Result<SurveyExpressionNode, SurveyLogicError>;
