import type { SurveyConditionAnswer } from "@/models/resource/survey/SurveyConditionAnswer";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { toSurveyConditionAnswer } from "@/services/resource/survey/toSurveyConditionAnswer";
import { getBlockLayerRows, getBlockNode } from "vue-block-editor-headless";
import { surveyNodeChildren, SurveyNodeType } from "vue-survey-engine-headless";

// The answers a condition may read, each question that holds one in document order and then each calculated value
export const getSurveyConditionAnswers = (document: SurveyDocument): SurveyConditionAnswer[] => {
  const questions = getBlockLayerRows(document, surveyNodeChildren).flatMap(({ nodePointer }) => {
    const node = getBlockNode(document, nodePointer, surveyNodeChildren);
    const answer = node && toSurveyConditionAnswer(node);
    return answer ? [answer] : [];
  });
  const calculatedValues = document.root.props.calculatedValues.map(({ name }) => ({
    name,
    title: name,
    type: SurveyNodeType.Expression,
  }));

  return [...questions, ...calculatedValues];
};
