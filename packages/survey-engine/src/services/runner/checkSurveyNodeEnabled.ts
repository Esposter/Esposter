import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyLogicContext } from "survey-logic";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkIsSurveyAnsweringNode } from "#src/services/runner/checkIsSurveyAnsweringNode";
import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";

// A node is enabled unless it is a calculated value, or it holds no answer and is not a container, or its enabling condition does not hold
// A calculated value holds a value no respondent gives, so it is never enabled. A page or a panel is a container, enabled by its own condition
// A dynamic panel's template reads its row through the panel scope, which the caller passes
export const checkSurveyNodeEnabled = (
  node: SurveyNode,
  values: SurveyLogicContext["values"],
  now: Date,
  scopes: SurveyLogicContext["scopes"] = {},
): boolean => {
  if (node.type === SurveyNodeType.Expression) return false;
  if (node.type !== SurveyNodeType.Page && node.type !== SurveyNodeType.Panel && !checkIsSurveyAnsweringNode(node))
    return false;

  const enableIf = "enableIf" in node.props ? node.props.enableIf : "";
  return enableIf === "" || checkSurveyExpressionHolds(enableIf, values, now, scopes);
};
