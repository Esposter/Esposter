import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyLogicContext } from "survey-logic";

import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";

// A node with no visibility condition is shown, and one whose condition does not hold is hidden
export const checkSurveyNodeVisible = (node: SurveyNode, values: SurveyLogicContext["values"], now: Date): boolean =>
  node.props.visibleIf === "" || checkSurveyExpressionHolds(node.props.visibleIf, values, now);
