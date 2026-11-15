import type { SurveyConditionRow } from "#src/models/resource/survey/SurveyConditionRow";

import { SurveyConditionOperator } from "#src/models/resource/survey/SurveyConditionOperator";
import { buildSurveyConditionValue } from "#src/services/resource/survey/buildSurveyConditionValue";

// A reference to the answer, then the operator, then the value when the operator takes one
export const buildSurveyConditionRow = ({ operator, questionName, value }: SurveyConditionRow): string => {
  const reference = `{${questionName}}`;
  const isTest = operator === SurveyConditionOperator.Empty || operator === SurveyConditionOperator.NotEmpty;
  if (isTest) return `${reference} ${operator}`;

  return `${reference} ${operator} ${buildSurveyConditionValue(value)}`;
};
