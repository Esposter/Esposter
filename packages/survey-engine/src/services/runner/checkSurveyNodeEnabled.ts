import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyLogicContext } from "survey-logic";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";

// A calculated value, a block of markup and a picture hold no answer the respondent gives, so none of them is ever enabled
const READ_ONLY_NODE_TYPES = new Set<SurveyNodeType>([
  SurveyNodeType.Expression,
  SurveyNodeType.Html,
  SurveyNodeType.Image,
]);

// A node is enabled unless it is read-only or its enabling condition does not hold, and a node with no condition is enabled
export const checkSurveyNodeEnabled = (node: SurveyNode, values: SurveyLogicContext["values"], now: Date): boolean => {
  if (READ_ONLY_NODE_TYPES.has(node.type)) return false;

  const enableIf = "enableIf" in node.props ? node.props.enableIf : "";
  return enableIf === "" || checkSurveyExpressionHolds(enableIf, values, now);
};
