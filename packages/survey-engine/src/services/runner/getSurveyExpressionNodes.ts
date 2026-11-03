import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { collectSurveyLeafNodes } from "#src/services/runner/collectSurveyLeafNodes";

const checkIsExpressionNode = (node: SurveyPlaceableNode): node is SurveyExpressionNode =>
  node.type === SurveyNodeType.Expression;

// The calculated-value questions a survey holds on its pages and in their panels. A dynamic panel's template is left out
// Its questions are evaluated once for each panel a respondent adds, with that panel's own scope
export const getSurveyExpressionNodes = (document: SurveyDocument): SurveyExpressionNode[] =>
  collectSurveyLeafNodes(
    document.content.flatMap((node) => (node.type === SurveyNodeType.Page ? node.props.children : [])),
    checkIsExpressionNode,
  );
