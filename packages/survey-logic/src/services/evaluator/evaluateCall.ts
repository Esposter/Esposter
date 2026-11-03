import type { SurveyExpressionCallNode } from "#src/models/SurveyExpressionCallNode";
import type { SurveyExpressionEvaluate } from "#src/models/SurveyExpressionEvaluate";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { surveyLogicFunctionMap } from "#src/services/functions/surveyLogicFunctionMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// A call runs the function its lowercased name finds. A name with no function is empty, and its arguments are not read
export const evaluateCall = (
  node: SurveyExpressionCallNode,
  context: SurveyLogicContext,
  evaluate: SurveyExpressionEvaluate,
): SurveyLogicValue => {
  const surveyLogicFunction = getOwnValue(surveyLogicFunctionMap, node.name.toLowerCase());
  if (surveyLogicFunction === undefined) return undefined;

  return surveyLogicFunction(
    node.args.map((argument) => evaluate(argument, context)),
    context,
  );
};
