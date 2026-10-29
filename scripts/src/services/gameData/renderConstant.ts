import { createKeyTreeNode } from "#src/services/gameData/createKeyTreeNode";
import { insertKey } from "#src/services/gameData/insertKey";
import { renderTree } from "#src/services/gameData/renderTree";

export const renderConstant = (name: string, keys: string[]): string => {
  const tree = createKeyTreeNode();
  for (const key of keys) insertKey(tree, key);
  return `export const ${name} = {\n${renderTree(tree, "  ")}\n} as const;`;
};
