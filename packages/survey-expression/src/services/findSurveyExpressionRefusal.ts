import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { getCallRefusal } from "#src/services/getCallRefusal";
import { getSurveyExpressionChildren } from "#src/services/getSurveyExpressionChildren";

// The first refused call in source order, at the position the call starts. A call starts before the calls in its
// Arguments, so it is checked before them
export const findSurveyExpressionRefusal = (node: SurveyExpressionNode): SurveyLogicError | undefined => {
  if (node.type === SurveyExpressionNodeType.Call) {
    const refusal = getCallRefusal(node);
    if (refusal !== undefined) return { message: refusal, position: node.position };
  }

  for (const child of getSurveyExpressionChildren(node)) {
    const refusal = findSurveyExpressionRefusal(child);
    if (refusal !== undefined) return refusal;
  }

  return undefined;
};
