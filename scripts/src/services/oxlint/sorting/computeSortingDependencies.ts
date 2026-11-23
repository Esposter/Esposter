import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";
import type { Context, ESTree, Reference } from "@oxlint/plugins";

import { checkIsNodeInsideDeferredFunction } from "#src/services/oxlint/sorting/checkIsNodeInsideDeferredFunction";
import { collectReadNames } from "#src/services/oxlint/sorting/collectReadNames";

// Each node's dependencies: the names of the nodes its references resolve to, and the names an extra reader reports.
// A read inside a deferred function is no dependency when `ignoreDeferredFunctions` is set, as a pattern's default is
export const computeSortingDependencies = (
  context: Context,
  partitions: SortingNode[][],
  options: {
    ignoreDeferredFunctions: boolean;
    memberNames?: (referencingNode: ESTree.Node, identifier: Reference["identifier"]) => string[];
  },
): SortingNode[][] => {
  const nodes = partitions.flat();
  const namesByNode = collectReadNames(context, nodes, (referencingNode, reference, referencedNode) => {
    const { identifier } = reference;
    const isDeferred =
      options.ignoreDeferredFunctions && checkIsNodeInsideDeferredFunction(identifier, referencingNode.node);
    return [
      ...(!isDeferred && referencedNode !== undefined && referencedNode !== referencingNode
        ? referencedNode.dependencyNames
        : []),
      ...(options.memberNames?.(referencingNode.node, identifier) ?? []),
    ];
  });
  return partitions.map((partition) =>
    partition.map((sortingNode) => ({ ...sortingNode, dependencies: namesByNode.get(sortingNode) ?? [] })),
  );
};
