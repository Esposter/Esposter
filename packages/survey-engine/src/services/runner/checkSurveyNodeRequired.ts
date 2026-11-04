import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyLogicContext } from "survey-logic";

import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";

// A node is required when its own flag says so or its requirement condition holds, and a node with neither is not required
// A dynamic panel's template reads its row through the panel scope, which the caller passes
export const checkSurveyNodeRequired = (
  node: SurveyNode,
  values: SurveyLogicContext["values"],
  now: Date,
  scopes: SurveyLogicContext["scopes"] = {},
): boolean => {
  if ("isRequired" in node.props && node.props.isRequired) return true;

  const requiredIf = "requiredIf" in node.props ? node.props.requiredIf : "";
  return requiredIf !== "" && checkSurveyExpressionHolds(requiredIf, values, now, scopes);
};
