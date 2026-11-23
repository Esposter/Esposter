import { RENDERED_CONSTANT_CLOSING } from "#src/services/hostedAssets/constants";
import { createKeyTreeNode } from "#src/services/hostedAssets/createKeyTreeNode";
import { insertKey } from "#src/services/hostedAssets/insertKey";
import { renderConstantOpening } from "#src/services/hostedAssets/renderConstantOpening";
import { renderTree } from "#src/services/hostedAssets/renderTree";

export const renderConstant = (name: string, keys: string[]): string => {
  const tree = createKeyTreeNode();
  for (const key of keys) insertKey(tree, key);
  return `${renderConstantOpening(name)}\n${renderTree(tree, "  ")}\n${RENDERED_CONSTANT_CLOSING}`;
};
