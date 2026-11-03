import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { surveyLogicFunctionMap } from "#src/services/functions/surveyLogicFunctionMap";
import { getSurveyExpressionChildren } from "#src/services/getSurveyExpressionChildren";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// The first call in source order to a name that no function has, at the position the call starts.
// A call starts before the calls in its arguments, so it is checked before them
export const findSurveyExpressionUnknownFunction = (node: SurveyExpressionNode): SurveyLogicError | undefined => {
  if (
    node.type === SurveyExpressionNodeType.Call &&
    getOwnValue(surveyLogicFunctionMap, node.name.toLowerCase()) === undefined
  )
    return { message: `Unknown function "${node.name}"`, position: node.position };

  for (const child of getSurveyExpressionChildren(node)) {
    const unknownFunction = findSurveyExpressionUnknownFunction(child);
    if (unknownFunction !== undefined) return unknownFunction;
  }

  return undefined;
};
