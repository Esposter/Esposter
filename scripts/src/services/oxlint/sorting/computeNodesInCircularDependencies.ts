import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

// Each node's edges: every node binding a name it reads, itself included when it reads a name it binds
const computeDependencyEdges = (nodes: SortingNode[]): Map<SortingNode, SortingNode[]> => {
  const bindersByName = new Map<string, SortingNode[]>();
  for (const node of nodes)
    for (const name of node.dependencyNames) bindersByName.set(name, [...(bindersByName.get(name) ?? []), node]);
  return new Map(
    nodes.map((node) => [node, node.dependencies.flatMap((name) => bindersByName.get(name) ?? [])] as const),
  );
};

// The nodes on a cycle of dependencies, which no order can satisfy, so they keep their place in the sort. These are the
// Members of every strongly connected component of more than one node, and of a node that reads its own binding
export const computeNodesInCircularDependencies = (nodes: SortingNode[]): Set<SortingNode> => {
  const edges = computeDependencyEdges(nodes);
  const indexes = new Map<SortingNode, number>();
  const lowLinks = new Map<SortingNode, number>();
  const stack: SortingNode[] = [];
  const onStack = new Set<SortingNode>();
  const nodesInCycles = new Set<SortingNode>();
  const strongConnect = (node: SortingNode): void => {
    const index = indexes.size;
    indexes.set(node, index);
    lowLinks.set(node, index);
    stack.push(node);
    onStack.add(node);
    for (const target of edges.get(node) ?? [])
      if (!indexes.has(target)) {
        strongConnect(target);
        lowLinks.set(node, Math.min(lowLinks.get(node) ?? index, lowLinks.get(target) ?? index));
      } else if (onStack.has(target))
        lowLinks.set(node, Math.min(lowLinks.get(node) ?? index, indexes.get(target) ?? index));

    if (lowLinks.get(node) !== index) return;
    const component: SortingNode[] = [];
    let member: SortingNode | undefined;
    do {
      member = stack.pop();
      if (member === undefined) break;
      onStack.delete(member);
      component.push(member);
    } while (member !== node);
    if (component.length > 1 || (edges.get(node) ?? []).includes(node))
      for (const member of component) nodesInCycles.add(member);
  };
  for (const node of nodes) if (!indexes.has(node)) strongConnect(node);
  return nodesInCycles;
};
