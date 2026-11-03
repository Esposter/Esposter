import type { SurveyHtmlNode, SurveyImageNode, SurveyQuestionNode } from "survey-engine";

import { SurveyNodeType } from "survey-engine";

// A descriptive element collects no answer, so it has neither a response column nor a summary card.
// Narrowing it out of the union leaves the props every answering question holds, its title included
export const checkIsAnsweringSurveyQuestion = (
  question: SurveyQuestionNode,
): question is Exclude<SurveyQuestionNode, SurveyHtmlNode | SurveyImageNode> =>
  question.type !== SurveyNodeType.Html && question.type !== SurveyNodeType.Image;
