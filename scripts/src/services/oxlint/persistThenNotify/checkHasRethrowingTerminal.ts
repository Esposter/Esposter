import type { ESTree } from "@oxlint/plugins";

import { checkIsRethrowingHandler } from "#src/services/oxlint/persistThenNotify/checkIsRethrowingHandler";

// The root says the chain STARTED in a wrapper; it says nothing about how the chain ENDS. `.match(noop, (error)
// => { throw error })` hands the rejection straight back to the awaiting caller, and rethrowing from the err branch is
// A documented repo idiom — so the terminal has to be read, not assumed.
export const checkHasRethrowingTerminal = (expression: ESTree.Expression): boolean => {
  if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") return false;
  const { callee } = expression;
  if (callee.property.type === "Identifier" && callee.property.name === "match") {
    const [, errorHandler] = expression.arguments;
    if (checkIsRethrowingHandler(errorHandler)) return true;
  }
  return checkHasRethrowingTerminal(callee.object);
};
