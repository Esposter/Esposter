import ts from "typescript";

// The node and every node beneath it, in source order, so a caller reads a whole subtree with one filter
export const getDescendants = (node: ts.Node): ts.Node[] => {
  const descendants: ts.Node[] = [node];
  ts.forEachChild(node, (child) => {
    descendants.push(...getDescendants(child));
  });
  return descendants;
};
