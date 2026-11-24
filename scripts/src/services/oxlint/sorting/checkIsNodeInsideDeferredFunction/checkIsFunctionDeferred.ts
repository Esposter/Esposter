import type { ESTree } from "@oxlint/plugins";

// A function is deferred when it is not called where it is written, so a read inside it happens after the pattern.
// A function handed to a call or a `new`, as an argument or as the callee, runs inside that expression, so it is not
// Deferred
export const checkIsFunctionDeferred = (functionNode: ESTree.Node): boolean => {
  const { parent } = functionNode;
  if (!parent) return false;
  return !["CallExpression", "NewExpression"].includes(parent.type);
};
