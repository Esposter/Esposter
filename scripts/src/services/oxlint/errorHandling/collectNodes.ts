import type { ESTree } from "@oxlint/plugins";

export const checkIsNode = (value: unknown): value is ESTree.Node =>
  typeof value === "object" && value !== null && "type" in value && typeof value.type === "string";

// Every node under a node, the node itself included, read off its keys rather than a visitor's key list
export const collectNodes = (root: ESTree.Node): ESTree.Node[] => {
  const nodes: ESTree.Node[] = [];
  const visit = (node: ESTree.Node): void => {
    nodes.push(node);
    for (const key of Object.keys(node)) {
      if (key === "parent") continue;
      const value: unknown = Reflect.get(node, key);
      const children: unknown[] = Array.isArray(value) ? value : [value];
      for (const child of children) if (checkIsNode(child)) visit(child);
    }
  };
  visit(root);
  return nodes;
};
