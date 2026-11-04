import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";
import type { Result } from "neverthrow";

import { evaluateSurveyExpression } from "#src/services/evaluateSurveyExpression";
import { parseSurveyExpression } from "#src/services/parseSurveyExpression";
import { toSurveyLogicAnswers } from "#src/services/shared/toSurveyLogicAnswer";

// Parses the source and evaluates the tree, or returns the parse's fault.
// The answers are read once as answers before any expression reads them, so a null the storage holds is unanswered by the time an expression sees it.
// A call to a name with no function is empty here, since refusing it is the check's job
export const runSurveyExpression = (
  source: string,
  context: {
    now: Date;
    scopes: Record<string, Record<string, SurveyLogicStoredValue>>;
    values: Record<string, SurveyLogicStoredValue>;
  },
): Result<SurveyLogicValue, SurveyLogicError> => {
  const answers: SurveyLogicContext = {
    now: context.now,
    scopes: Object.fromEntries(
      Object.entries(context.scopes).map(([name, scope]) => [name, toSurveyLogicAnswers(scope)]),
    ),
    values: toSurveyLogicAnswers(context.values),
  };

  return parseSurveyExpression(source).map((node) => evaluateSurveyExpression(node, answers));
};
