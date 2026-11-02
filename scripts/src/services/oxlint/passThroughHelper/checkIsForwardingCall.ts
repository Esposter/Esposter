import type { ESTree } from "@oxlint/plugins";

import { UPPER_SNAKE_REGEX } from "#src/services/oxlint/passThroughHelper/constants";
import { getArgumentName } from "#src/services/oxlint/passThroughHelper/getArgumentName";
import { getReceiverName } from "#src/services/oxlint/passThroughHelper/getReceiverName";

export const checkIsForwardingCall = (
  parameterNames: string[],
  expression: ESTree.CallExpression | ESTree.NewExpression,
): boolean => {
  const receiverName = getReceiverName(expression);
  // A member call is no forward on a receiver that is not an identifier, nor on an UPPER_SNAKE constant, which the
  // Wrapper supplies outright. Any other identifier receiver is matched as a plain call is, so a module's own binding
  // Forwards as a parameter does: the rule exempts no other supplied object
  if (expression.type === "CallExpression" && expression.callee.type === "MemberExpression") {
    if (receiverName === undefined || UPPER_SNAKE_REGEX.test(receiverName)) return false;
  } else if (expression.callee.type !== "Identifier") return false;
  const expectedNames = receiverName === parameterNames[0] ? parameterNames.slice(1) : parameterNames;
  const argumentNames = expression.arguments.map((argument) => getArgumentName(argument));
  if (argumentNames.length === expectedNames.length)
    return argumentNames.every((argumentName, index) => argumentName === expectedNames[index]);
  else return false;
};
