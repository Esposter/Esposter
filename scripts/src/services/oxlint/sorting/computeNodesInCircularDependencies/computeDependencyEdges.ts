import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

import { getOrCreate } from "@esposter/shared";

// Each node's edges: every node binding a name it reads, itself included when it reads a name it binds
export const computeDependencyEdges = (nodes: SortingNode[]): Map<SortingNode, SortingNode[]> => {
  const nameBindersMap = new Map<string, SortingNode[]>();
  for (const node of nodes)
    for (const name of node.dependencyNames) getOrCreate(nameBindersMap, name, () => []).push(node);
  return new Map(
    nodes.map((node) => [node, node.dependencies.flatMap((name) => nameBindersMap.get(name) ?? [])] as const),
  );
};
