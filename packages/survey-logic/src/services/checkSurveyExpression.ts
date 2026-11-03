import type { SurveyLogicError } from "#src/models/SurveyLogicError";

import { findSurveyExpressionUnknownFunction } from "#src/services/findSurveyExpressionUnknownFunction";
import { parseSurveyExpression } from "#src/services/parseSurveyExpression";

// Refuses a source that does not parse, with the parse's fault, or that calls a function the map lacks.
// The refusal names the first such call. A source that passes returns no error
export const checkSurveyExpression = (source: string): SurveyLogicError | undefined =>
  parseSurveyExpression(source).match(findSurveyExpressionUnknownFunction, (error) => error);
