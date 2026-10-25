import type { SceneTreeNode } from "#src/models/genshinAssets/scene/SceneTreeNode";

export const pruneNode = (node: SceneTreeNode, depth: number): SceneTreeNode => ({
  ...node,
  children: depth > 0 ? node.children.map((child) => pruneNode(child, depth - 1)) : [],
});
