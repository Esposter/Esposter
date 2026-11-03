import type { SurveyHtmlNode, SurveyImageNode, SurveyQuestionNode } from "survey-engine";

import { SurveyNodeType } from "survey-engine";

// A descriptive element collects no answer, so it has neither a response column nor a summary card, and narrowing it out
// of the union leaves the props every answering question holds, its title included
export const isAnsweringSurveyQuestion = (
  question: SurveyQuestionNode,
): question is Exclude<SurveyQuestionNode, SurveyHtmlNode | SurveyImageNode> =>
  question.type !== SurveyNodeType.Html && question.type !== SurveyNodeType.Image;
