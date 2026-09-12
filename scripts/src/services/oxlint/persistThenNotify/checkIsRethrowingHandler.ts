import type { ESTree } from "@oxlint/plugins";

import { checkHasOwnRejection } from "#src/services/oxlint/persistThenNotify/checkHasOwnRejection";
import { checkIsPromiseReject } from "#src/services/oxlint/persistThenNotify/checkIsPromiseReject";
import { FunctionNodeTypes, RethrowingCallees } from "#src/services/oxlint/persistThenNotify/constants";

// An err handler that puts the rejection back rather than absorbing it: throwing, returning a rejected promise,
// Or passing a rethrowing callee directly.
export const checkIsRethrowingHandler = (node: unknown): boolean => {
  if (node === null || typeof node !== "object") return false;
  const expression = node as ESTree.Node;
  if (expression.type === "Identifier") return RethrowingCallees.has(expression.name);
  if (expression.type === "CallExpression")
    return (
      (expression.callee.type === "Identifier" && RethrowingCallees.has(expression.callee.name)) ||
      checkIsPromiseReject(expression)
    );
  if (checkIsPromiseReject(expression)) return true;
  if (!FunctionNodeTypes.has(expression.type)) return false;
  const functionNode = expression as ESTree.ArrowFunctionExpression | ESTree.Function;
  if (functionNode.type === "ArrowFunctionExpression" && functionNode.expression)
    return checkIsPromiseReject(functionNode.body);
  return functionNode.body ? checkHasOwnRejection(functionNode.body) : false;
};
