import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";

import { checkSurveyExpressionField } from "#src/services/checkSurveyExpressionField";

// An empty expression is absent, so it is never read: a condition with none holds always, and a calculated value with none computes nothing
export const checkSurveyOptionalExpression = (
  source: string,
  label: string,
  pointer: string,
  issues: SurveyDocumentIssue[],
): void => {
  if (source === "") return;

  checkSurveyExpressionField(source, label, pointer, issues);
};
