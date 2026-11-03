import type { SurveyDocument, SurveyNode, SurveyQuestionNode } from "survey-engine";

import { SurveyNodeType } from "survey-engine";

// The questions in the order a respondent meets them. A dynamic panel is one question whose template is not walked,
// since the template's questions answer inside that one question rather than being questions of the survey of their own
const flattenQuestions = (nodes: SurveyNode[]): SurveyQuestionNode[] =>
  nodes.flatMap((node) =>
    node.type === SurveyNodeType.Page || node.type === SurveyNodeType.Panel
      ? flattenQuestions(node.props.children)
      : [node],
  );

export const getSurveyDocumentQuestions = ({ content }: SurveyDocument): SurveyQuestionNode[] =>
  flattenQuestions(content);
