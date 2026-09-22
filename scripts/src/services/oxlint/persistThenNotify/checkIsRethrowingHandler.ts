import type { ESTree } from "@oxlint/plugins";

import { checkHasOwnRejection } from "#src/services/oxlint/persistThenNotify/checkHasOwnRejection";
import { checkIsPromiseReject } from "#src/services/oxlint/persistThenNotify/checkIsPromiseReject";
import { RETHROWING_CALLEES } from "#src/services/oxlint/persistThenNotify/constants";

// An err handler that puts the rejection back rather than absorbing it: throwing, returning a rejected promise,
// Or passing a rethrowing callee directly.
export const checkIsRethrowingHandler = (expression: ESTree.Node | undefined): boolean => {
  if (expression === undefined) return false;
  else if (expression.type === "Identifier") return RETHROWING_CALLEES.has(expression.name);
  else if (expression.type === "CallExpression")
    return (
      (expression.callee.type === "Identifier" && RETHROWING_CALLEES.has(expression.callee.name)) ||
      checkIsPromiseReject(expression)
    );
  else if (checkIsPromiseReject(expression)) return true;
  // A concise body is the handler's whole answer, so it is classified exactly as the handler itself would be:
  // `(error) => logAndRethrow(error)` puts the rejection back as surely as a block that throws
  else if (expression.type === "ArrowFunctionExpression")
    return expression.expression ? checkIsRethrowingHandler(expression.body) : checkHasOwnRejection(expression.body);
  else if (expression.type === "FunctionDeclaration" || expression.type === "FunctionExpression")
    return checkHasOwnRejection(expression.body);
  else return false;
};
