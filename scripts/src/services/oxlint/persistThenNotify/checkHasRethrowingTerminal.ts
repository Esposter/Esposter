import type { ESTree } from "@oxlint/plugins";

import { checkIsRethrowingHandler } from "#src/services/oxlint/persistThenNotify/checkIsRethrowingHandler";

// The root says the chain STARTED in a wrapper; it says nothing about how the chain ENDS. `.match(noop, (error)
// => { throw error })` and `._unsafeUnwrap()` both hand the rejection straight back to the awaiting caller, and
// Rethrowing from the err branch is a documented repo idiom — so the terminal has to be read, not assumed.
export const checkHasRethrowingTerminal = (expression: ESTree.Expression): boolean => {
  if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") return false;
  const { callee } = expression;
  if (callee.property.type === "Identifier") {
    if (callee.property.name === "_unsafeUnwrap") return true;
    const [, errorHandler] = expression.arguments;
    if (callee.property.name === "match" && checkIsRethrowingHandler(errorHandler)) return true;
  }
  return checkHasRethrowingTerminal(callee.object);
};
