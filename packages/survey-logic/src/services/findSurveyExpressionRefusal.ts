import type { SurveyExpressionCallNode } from "#src/models/SurveyExpressionCallNode";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { surveyLogicFunctionMap } from "#src/services/functions/surveyLogicFunctionMap";
import { getSurveyExpressionChildren } from "#src/services/getSurveyExpressionChildren";
import { checkIsSurveyFieldName } from "#src/services/shared/checkIsSurveyFieldName";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// The array functions that take a filter, by their lowercase name. A filter is a condition over each item, which the
// Arguments of a call cannot carry, so the form is refused rather than answered without it
const FILTER_FUNCTION_NAMES: ReadonlySet<string> = new Set([
  "avginarray",
  "countinarray",
  "maxinarray",
  "mininarray",
  "suminarray",
]);

// The reason a call is refused, or undefined when it is supported. A third argument that is a text naming a field is the
// Return-field form, which is supported, so only a fourth argument or a third that is not such a text is a filter
const getCallRefusal = (node: SurveyExpressionCallNode): string | undefined => {
  const name = node.name.toLowerCase();
  if (getOwnValue(surveyLogicFunctionMap, name) === undefined) return `Unknown function "${node.name}"`;
  if (!FILTER_FUNCTION_NAMES.has(name) || node.args.length < 3) return undefined;

  const third = node.args.at(2);
  const isReturnField =
    node.args.length === 3 &&
    third?.type === SurveyExpressionNodeType.Literal &&
    typeof third.value === "string" &&
    checkIsSurveyFieldName(third.value);
  return isReturnField ? undefined : `The filter form of "${node.name}" is not supported`;
};

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
