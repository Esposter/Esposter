import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyLogicContext } from "survey-expression";

import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";
import { checkIsBlankText } from "@esposter/shared";

// A node with no visibility condition is shown, and one whose condition does not hold is hidden
// A dynamic panel's template reads its row through the panel scope, which the caller passes
export const checkSurveyNodeVisible = (
  node: SurveyNode,
  values: SurveyLogicContext["values"],
  now: Date,
  scopes: SurveyLogicContext["scopes"] = {},
): boolean =>
  checkIsBlankText(node.props.visibleIf) || checkSurveyExpressionHolds(node.props.visibleIf, values, now, scopes);
