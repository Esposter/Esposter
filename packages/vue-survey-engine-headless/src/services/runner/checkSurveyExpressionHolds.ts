import type { SurveyLogicContext } from "survey-expression";

import { runSurveyExpression } from "survey-expression";

// An expression holds when it evaluates to `true` without a fault. A value that is not `true` does not hold, and a fault
// Reads as not holding, so a condition that faults shows nothing its answer would not show
// The scopes are the panel a template question's row adds, and none for a question of the survey's own
export const checkSurveyExpressionHolds = (
  source: string,
  values: SurveyLogicContext["values"],
  now: Date,
  scopes: SurveyLogicContext["scopes"] = {},
): boolean =>
  runSurveyExpression(source, { now, scopes, values })
    .map((value) => value === true)
    .unwrapOr(false);
