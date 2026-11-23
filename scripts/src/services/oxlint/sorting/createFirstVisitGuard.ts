import type { ESTree } from "@oxlint/plugins";

// `oxlint` hands a type inside a type annotation to the visitor twice, so a rule reads each type once by where it starts
export const createFirstVisitGuard = (): ((node: ESTree.Node) => boolean) => {
  const visitedStarts = new Set<number>();
  return (node) => {
    if (visitedStarts.has(node.start)) return false;
    visitedStarts.add(node.start);
    return true;
  };
};
