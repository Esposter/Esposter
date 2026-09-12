import type { ESTree } from "@oxlint/plugins";

import { checkIsForwardingCall } from "#src/services/oxlint/passThroughHelper/checkIsForwardingCall";
import { checkIsForwardingRead } from "#src/services/oxlint/passThroughHelper/checkIsForwardingRead";
import { getParameterName } from "#src/services/oxlint/passThroughHelper/getParameterName";

export const checkIsForwardingArrow = (arrow: ESTree.ArrowFunctionExpression): boolean => {
  const parameterNames = arrow.params
    .map((parameter) => getParameterName(parameter))
    .filter((parameterName) => parameterName !== undefined);
  if (parameterNames.length !== arrow.params.length) return false;
  // `async (a) => await f(a)` forwards exactly as its sync twin does
  const body = arrow.body.type === "AwaitExpression" ? arrow.body.argument : arrow.body;
  if (body.type === "MemberExpression") return checkIsForwardingRead(parameterNames, body);
  else if (body.type === "CallExpression" || body.type === "NewExpression")
    return checkIsForwardingCall(parameterNames, body);
  else return false;
};
