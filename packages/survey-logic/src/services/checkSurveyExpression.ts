import type { SurveyLogicError } from "#src/models/SurveyLogicError";

import { findSurveyExpressionRefusal } from "#src/services/findSurveyExpressionRefusal";
import { parseSurveyExpression } from "#src/services/parseSurveyExpression";

// Refuses a source that does not parse, with the parse's fault, that calls a function the map lacks, or that calls an
// Array function's filter form, which is not supported. The refusal names the first such call. A source that passes
// Returns no error
export const checkSurveyExpression = (source: string): SurveyLogicError | undefined =>
  parseSurveyExpression(source).match(findSurveyExpressionRefusal, (error) => error);
