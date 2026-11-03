import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// Evaluates a sub-expression of the one being evaluated. The evaluators reach one another through this callback, never by
// Import, so no two of them import each other
export type SurveyExpressionEvaluate = (node: SurveyExpressionNode, context: SurveyLogicContext) => SurveyLogicValue;
