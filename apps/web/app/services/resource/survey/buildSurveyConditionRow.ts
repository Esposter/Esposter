import type { SurveyConditionRow } from "@/models/resource/survey/SurveyConditionRow";

import { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import { buildSurveyConditionValue } from "@/services/resource/survey/buildSurveyConditionValue";

// A reference to the answer, then the operator, then the value when the operator takes one
export const buildSurveyConditionRow = ({ operator, questionName, value }: SurveyConditionRow): string => {
  const reference = `{${questionName}}`;
  const isTest = [SurveyConditionOperator.Empty, SurveyConditionOperator.NotEmpty].includes(operator);
  if (isTest) return `${reference} ${operator}`;

  return `${reference} ${operator} ${buildSurveyConditionValue(value)}`;
};
