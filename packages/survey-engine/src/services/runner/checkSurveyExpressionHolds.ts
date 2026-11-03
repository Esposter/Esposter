import type { SurveyLogicContext } from "survey-logic";

import { runSurveyExpression } from "survey-logic";

// An expression holds when it evaluates to a truthy value without a fault
// A fault reads as not holding, so a condition that faults shows nothing its answer would not show
// The scopes are the panel a template question's row adds, and none for a question of the survey's own
export const checkSurveyExpressionHolds = (
  source: string,
  values: SurveyLogicContext["values"],
  now: Date,
  scopes: SurveyLogicContext["scopes"] = {},
): boolean => runSurveyExpression(source, { now, scopes, values }).map(Boolean).unwrapOr(false);
