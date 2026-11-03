import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyQuestionNode } from "#src/models/SurveyQuestionNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";

// The questions in a tree of nodes, in the order a respondent meets them, read through the pages and panels that hold them.
// A dynamic panel is one question: its template answers inside it, not as questions of the survey of their own
export const flattenSurveyQuestions = (nodes: SurveyNode[]): SurveyQuestionNode[] =>
  nodes.flatMap((node) =>
    node.type === SurveyNodeType.Page || node.type === SurveyNodeType.Panel
      ? flattenSurveyQuestions(node.props.children)
      : [node],
  );
