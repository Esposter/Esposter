import type { SurveyLogicContext } from "survey-logic";

import { runSurveyExpression } from "survey-logic";

// An expression holds when it evaluates to a truthy value without a fault
// A fault reads as not holding, so a condition that faults shows nothing its answer would not show
export const checkSurveyExpressionHolds = (source: string, values: SurveyLogicContext["values"], now: Date): boolean =>
  runSurveyExpression(source, { now, scopes: {}, values }).map(Boolean).unwrapOr(false);
