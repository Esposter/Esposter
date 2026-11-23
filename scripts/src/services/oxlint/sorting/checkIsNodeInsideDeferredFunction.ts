import type { ESTree } from "@oxlint/plugins";

import { checkIsFunctionDeferred } from "#src/services/oxlint/sorting/checkIsNodeInsideDeferredFunction/checkIsFunctionDeferred";
import { computeAncestors } from "#src/services/oxlint/sorting/computeModuleDependencies/computeAncestors";

// Whether a node sits inside a deferred function written below the given ancestor
export const checkIsNodeInsideDeferredFunction = (node: ESTree.Node, maxParent: ESTree.Node): boolean =>
  computeAncestors(
    node,
    maxParent,
    (ancestor): ancestor is ESTree.ArrowFunctionExpression | ESTree.Function =>
      ["ArrowFunctionExpression", "FunctionExpression"].includes(ancestor.type),
    false,
  ).some((ancestor) => checkIsFunctionDeferred(ancestor));
