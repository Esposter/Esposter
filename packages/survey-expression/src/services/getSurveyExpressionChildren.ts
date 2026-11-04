import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { exhaustiveGuard } from "@esposter/shared";

// The sub-expressions a node holds, in the order the source reads them.
// A walk that visits them in turn visits the source in order
export const getSurveyExpressionChildren = (node: SurveyExpressionNode): SurveyExpressionNode[] => {
  switch (node.type) {
    case SurveyExpressionNodeType.Binary:
      return [node.left, node.right];
    case SurveyExpressionNodeType.Call:
      return node.args;
    case SurveyExpressionNodeType.List:
      return node.items;
    case SurveyExpressionNodeType.Literal:
    case SurveyExpressionNodeType.Reference:
      return [];
    case SurveyExpressionNodeType.Unary:
      return [node.operand];
    default:
      return exhaustiveGuard(node);
  }
};
