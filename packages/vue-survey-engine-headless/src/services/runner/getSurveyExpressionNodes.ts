import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { flattenSurveyQuestions } from "#src/services/flattenSurveyQuestions";

// The calculated-value questions a survey holds on its pages and in their panels. A dynamic panel's template is left out
// Its questions are evaluated once for each panel a respondent adds, with that panel's own scope
export const getSurveyExpressionNodes = (document: SurveyDocument): SurveyExpressionNode[] =>
  flattenSurveyQuestions(document.content).filter((node) => node.type === SurveyNodeType.Expression);
