import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";

import { checkSurveyExpression } from "survey-expression";

// Refuses an expression the expression language does not parse, naming the field it sits in and where the parser stopped
export const checkSurveyExpressionField = (
  source: string,
  label: string,
  pointer: string,
  issues: SurveyDocumentIssue[],
): void => {
  const expressionError = checkSurveyExpression(source);
  if (expressionError === undefined) return;

  issues.push({
    message: `The ${label} does not parse: ${expressionError.message} (at position ${expressionError.position})`,
    pointer,
  });
};
