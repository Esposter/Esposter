import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";

// The calculated-value questions of a list of placeable nodes, read through the panels that hold them, in document order
const collectExpressionNodes = (nodes: SurveyPlaceableNode[]): SurveyExpressionNode[] =>
  nodes.flatMap((node) => {
    if (node.type === SurveyNodeType.Panel) return collectExpressionNodes(node.props.children);

    return node.type === SurveyNodeType.Expression ? [node] : [];
  });

// The calculated-value questions a survey holds on its pages and in their panels. A dynamic panel's template is left out
// Its questions are evaluated once for each panel a respondent adds, with that panel's own scope
export const getSurveyExpressionNodes = (document: SurveyDocument): SurveyExpressionNode[] =>
  collectExpressionNodes(
    document.content.flatMap((node) => (node.type === SurveyNodeType.Page ? node.props.children : [])),
  );
