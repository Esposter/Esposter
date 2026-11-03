import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";
import type { Result } from "neverthrow";

import { evaluateSurveyExpression } from "#src/services/evaluateSurveyExpression";
import { parseSurveyExpression } from "#src/services/parseSurveyExpression";

// Parses the source and evaluates the tree, or returns the parse's fault.
// A call to a name with no function is empty here, since refusing it is the check's job
export const runSurveyExpression = (
  source: string,
  context: SurveyLogicContext,
): Result<SurveyLogicValue, SurveyLogicError> =>
  parseSurveyExpression(source).map((node) => evaluateSurveyExpression(node, context));
