import type { SurveyExpressionListNode } from "#src/models/SurveyExpressionListNode";
import type { SurveyExpressionEvaluate } from "#src/models/SurveyExpressionEvaluate";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// A list holds the value of each of its items, in the order the source writes them
export const evaluateList = (
  node: SurveyExpressionListNode,
  context: SurveyLogicContext,
  evaluate: SurveyExpressionEvaluate,
): SurveyLogicValue[] => node.items.map((item) => evaluate(item, context));
