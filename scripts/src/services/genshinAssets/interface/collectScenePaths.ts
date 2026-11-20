import type { SceneTreeNode } from "#src/models/genshinAssets/scene/SceneTreeNode";

export const collectScenePaths = ({ children, object }: SceneTreeNode, fatherPath = ""): string[] => {
  const path = fatherPath ? `${fatherPath}/${object.name}` : object.name;
  return [path, ...children.flatMap((child) => collectScenePaths(child, path))];
};
