import type { ESTree } from "@oxlint/plugins";

import { UPPER_SNAKE_REGEX } from "#src/services/oxlint/passThroughHelper/constants";
import { getArgumentName } from "#src/services/oxlint/passThroughHelper/getArgumentName";
import { getReceiverName } from "#src/services/oxlint/passThroughHelper/getReceiverName";

export const checkIsForwardingCall = (
  parameterNames: string[],
  expression: ESTree.CallExpression | ESTree.NewExpression,
): boolean => {
  const receiverName = getReceiverName(expression);
  // A member call is only a forward when the receiver came from the caller too; on anything else the wrapper
  // Is supplying the object, and an UPPER_SNAKE one is supplying a constant outright
  if (expression.type === "CallExpression" && expression.callee.type === "MemberExpression") {
    if (receiverName === undefined || UPPER_SNAKE_REGEX.test(receiverName)) return false;
  } else if (expression.callee.type !== "Identifier") return false;
  const expectedNames = receiverName === parameterNames[0] ? parameterNames.slice(1) : parameterNames;
  const argumentNames = expression.arguments.map((argument) => getArgumentName(argument));
  if (argumentNames.length !== expectedNames.length) return false;
  return argumentNames.every((argumentName, index) => argumentName === expectedNames[index]);
};
