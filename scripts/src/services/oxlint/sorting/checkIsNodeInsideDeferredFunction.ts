import type { ESTree } from "@oxlint/plugins";

// A function is deferred when it is not called where it is written, so a read inside it happens after the pattern.
// A function handed to a call or a `new`, as an argument or as the callee, runs inside that expression, so it is not deferred
const checkIsFunctionDeferred = (functionNode: ESTree.Node): boolean => {
  const { parent } = functionNode;
  if (!parent) return false;
  return !["CallExpression", "NewExpression"].includes(parent.type);
};

// Whether a node sits inside a deferred function written below the given ancestor
export const checkIsNodeInsideDeferredFunction = (node: ESTree.Node, maxParent: ESTree.Node): boolean => {
  for (let ancestor = node.parent; ancestor && ancestor !== maxParent; ancestor = ancestor.parent)
    if (
      (ancestor.type === "FunctionExpression" || ancestor.type === "ArrowFunctionExpression") &&
      checkIsFunctionDeferred(ancestor)
    )
      return true;
  return false;
};
