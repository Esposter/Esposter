import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { exhaustiveGuard } from "@esposter/shared";

// Visits the children left to right, depth first, so each reference is added at the first place the source reads it
export const walkSurveyExpressionReferences = (node: SurveyExpressionNode, names: Set<string>): void => {
  switch (node.type) {
    case SurveyExpressionNodeType.Binary:
      walkSurveyExpressionReferences(node.left, names);
      walkSurveyExpressionReferences(node.right, names);
      break;
    case SurveyExpressionNodeType.Call:
      for (const argument of node.args) walkSurveyExpressionReferences(argument, names);
      break;
    case SurveyExpressionNodeType.List:
      for (const item of node.items) walkSurveyExpressionReferences(item, names);
      break;
    case SurveyExpressionNodeType.Literal:
      break;
    case SurveyExpressionNodeType.Reference:
      names.add(node.name);
      break;
    case SurveyExpressionNodeType.Unary:
      walkSurveyExpressionReferences(node.operand, names);
      break;
    default:
      exhaustiveGuard(node);
  }
};
