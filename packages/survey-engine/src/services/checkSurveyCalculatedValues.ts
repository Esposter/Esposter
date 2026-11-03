import type { SurveyCalculatedValue } from "#src/models/SurveyCalculatedValue";
import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";

import { checkSurveyExpressionField } from "#src/services/checkSurveyExpressionField";

// A calculated value's name collides with no question's name nor an earlier calculated value's, and its expression parses
export const checkSurveyCalculatedValues = (
  calculatedValues: readonly SurveyCalculatedValue[],
  listPointer: string,
  names: Set<string>,
  issues: SurveyDocumentIssue[],
): void => {
  for (const [index, calculatedValue] of calculatedValues.entries()) {
    const calculatedValuePointer = `${listPointer}/${index}`;
    if (names.has(calculatedValue.name))
      issues.push({
        message: `The name "${calculatedValue.name}" is already used by a question or an earlier calculated value`,
        pointer: `${calculatedValuePointer}/name`,
      });
    names.add(calculatedValue.name);

    checkSurveyExpressionField(
      calculatedValue.expression,
      "calculated value expression",
      `${calculatedValuePointer}/expression`,
      issues,
    );
  }
};
