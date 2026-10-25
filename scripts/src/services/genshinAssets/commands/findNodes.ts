import type { SceneTreeNode } from "#src/models/genshinAssets/scene/SceneTreeNode";

// Every node named so at any depth, or the node itself when it is
export const findNodes = (node: SceneTreeNode, name: string): SceneTreeNode[] =>
  node.object.name === name ? [node] : node.children.flatMap((child) => findNodes(child, name));
