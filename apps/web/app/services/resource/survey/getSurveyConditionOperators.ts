import type { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";

import {
  SURVEY_BOOLEAN_CONDITION_OPERATORS,
  SURVEY_LIST_CONDITION_OPERATORS,
  SURVEY_SCALAR_CONDITION_OPERATORS,
} from "@/services/resource/survey/constants";
import { SurveyNodeType } from "vue-survey-engine-headless";

// The comparisons that suit an answer's kind: a yes or no answer is equal or not, a list only contains or does not, and
// Every other answer takes the full set. An answer the document names no kind for takes the full set too
export const getSurveyConditionOperators = (type: SurveyNodeType | undefined): readonly SurveyConditionOperator[] => {
  if (type === SurveyNodeType.Boolean) return SURVEY_BOOLEAN_CONDITION_OPERATORS;

  const listTypes = [
    SurveyNodeType.Checkbox,
    SurveyNodeType.TagBox,
    SurveyNodeType.Ranking,
    SurveyNodeType.Matrix,
    SurveyNodeType.MatrixDynamic,
    SurveyNodeType.PanelDynamic,
    SurveyNodeType.MultipleText,
  ];
  return type !== undefined && listTypes.includes(type)
    ? SURVEY_LIST_CONDITION_OPERATORS
    : SURVEY_SCALAR_CONDITION_OPERATORS;
};
