import type { SceneTreeNode } from "#src/models/genshinAssets/scene/SceneTreeNode";

export const collectScenePaths = ({ children, object }: SceneTreeNode, father = ""): string[] => {
  const path = father ? `${father}/${object.name}` : object.name;
  return [path, ...children.flatMap((child) => collectScenePaths(child, path))];
};
