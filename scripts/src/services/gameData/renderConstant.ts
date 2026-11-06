import { RENDERED_CONSTANT_CLOSING } from "#src/services/gameData/constants";
import { createKeyTreeNode } from "#src/services/gameData/createKeyTreeNode";
import { insertKey } from "#src/services/gameData/insertKey";
import { renderConstantOpening } from "#src/services/gameData/renderConstantOpening";
import { renderTree } from "#src/services/gameData/renderTree";

export const renderConstant = (name: string, keys: string[]): string => {
  const tree = createKeyTreeNode();
  for (const key of keys) insertKey(tree, key);
  return `${renderConstantOpening(name)}\n${renderTree(tree, "  ")}\n${RENDERED_CONSTANT_CLOSING}`;
};
