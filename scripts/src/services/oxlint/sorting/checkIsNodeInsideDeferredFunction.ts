import type { ESTree } from "@oxlint/plugins";

import { checkIsFunctionDeferred } from "#src/services/oxlint/sorting/checkIsNodeInsideDeferredFunction/checkIsFunctionDeferred";

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
