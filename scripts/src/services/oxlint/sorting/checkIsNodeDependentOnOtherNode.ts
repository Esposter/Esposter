import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

// Whether the first node binds a name the second one reads, so the second sorts after the first
export const checkIsNodeDependentOnOtherNode = (sortingNode: SortingNode, otherNode: SortingNode): boolean =>
  sortingNode !== otherNode && sortingNode.dependencyNames.some((name) => otherNode.dependencies.includes(name));
