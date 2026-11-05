import type { SurveyExpressionCallNode } from "#src/models/SurveyExpressionCallNode";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { ArrayFunctionMap } from "#src/services/functions/ArrayFunctionMap";
import { SurveyLogicFunctionMap } from "#src/services/functions/SurveyLogicFunctionMap";
import { checkIsSurveyReturnField } from "#src/services/shared/checkIsSurveyReturnField";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// The reason a call is refused, or undefined when it is supported. A third argument that is a text naming a field is the
// Return-field form, which is supported, so only a fourth argument or a third that is not such a text is a filter
export const getCallRefusal = (node: SurveyExpressionCallNode): string | undefined => {
  const name = node.name.toLowerCase();
  if (getOwnValue(SurveyLogicFunctionMap, name) === undefined) return `Unknown function "${node.name}"`;
  if (getOwnValue(ArrayFunctionMap, name) === undefined || node.args.length < 3) return undefined;

  const third = node.args.at(2);
  const isReturnField =
    node.args.length === 3 && third?.type === SurveyExpressionNodeType.Literal && checkIsSurveyReturnField(third.value);
  return isReturnField ? undefined : `The filter form of "${node.name}" is not supported`;
};
