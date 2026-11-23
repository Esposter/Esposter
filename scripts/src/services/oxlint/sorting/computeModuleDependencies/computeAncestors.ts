import type { ESTree } from "@oxlint/plugins";

import { checkIsSameNode } from "#src/services/oxlint/sorting/computeModuleDependencies/checkIsSameNode";

// The ancestors of a node that pass the guard, up to the statement holding it.
// With `consecutiveOnly`, the run stops at the first ancestor that does not pass it.
export const computeAncestors = <T extends ESTree.Node>(
  node: ESTree.Node,
  statement: ESTree.Node,
  checkWanted: (ancestor: ESTree.Node) => ancestor is T,
  consecutiveOnly: boolean,
): T[] => {
  const ancestors: T[] = [];
  let parent: ESTree.Node | null = node.parent;
  while (parent && !checkIsSameNode(parent, statement)) {
    if (checkWanted(parent)) ancestors.push(parent);
    else if (consecutiveOnly) break;
    parent = parent.parent;
  }
  return ancestors;
};
