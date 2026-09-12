import type { ESTree } from "@oxlint/plugins";

import { checkIsForwardingCall } from "#src/services/oxlint/passThroughHelper/checkIsForwardingCall";

// A read of what a forward would have returned is the same rename one step further out:
// `() => useVTheme().global` and `(a) => a.b` both hand back a property the caller could have reached
// Itself.
export const checkIsForwardingRead = (parameterNames: string[], expression: ESTree.MemberExpression): boolean => {
  if (expression.computed) return false;
  const { object } = expression;
  if (object.type === "Identifier") return parameterNames.includes(object.name);
  else if (object.type === "CallExpression" || object.type === "NewExpression")
    return checkIsForwardingCall(parameterNames, object);
  else return false;
};
