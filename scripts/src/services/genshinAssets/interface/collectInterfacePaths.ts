import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

// Every path in a tree, each node's named from the root down
export const collectInterfacePaths = (node: InterfaceNode): string[] => [
  node.path,
  ...node.children.flatMap((child) => collectInterfacePaths(child)),
];
