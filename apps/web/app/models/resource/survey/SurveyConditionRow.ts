import type { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import type { SurveyConditionValue } from "@/models/resource/survey/SurveyConditionValue";

// One comparison of a condition: the answer it reads, the operator and the value it compares with. An empty test takes no
// Value, so its value is the empty string
export interface SurveyConditionRow {
  operator: SurveyConditionOperator;
  questionName: string;
  value: SurveyConditionValue;
}
