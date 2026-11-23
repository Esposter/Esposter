import { createKeyTreeNode } from "#src/services/hostedAssets/createKeyTreeNode";
import { insertKey } from "#src/services/hostedAssets/insertKey";
import { RENDERED_CONSTANT_CLOSING } from "#src/services/hostedAssets/renderConstantClosing";
import { renderConstantOpening } from "#src/services/hostedAssets/renderConstantOpening";
import { renderTree } from "#src/services/hostedAssets/renderTree";

export const renderConstant = (name: string, pairs: [name: string, lockKey: string][]): string => {
  const tree = createKeyTreeNode();
  const names = new Set<string>();
  for (const [keyName, lockKey] of pairs) {
    // oxlint-disable-next-line error-handling/no-bare-error -- the renderer runs from `nuxt prepare` before any workspace package is built, so it cannot import InvalidOperationError from @esposter/shared
    if (names.has(keyName)) throw new Error(`${keyName} is derived by two lock keys, so it names only one of them`);
    names.add(keyName);
    insertKey(tree, keyName, lockKey);
  }
  return `${renderConstantOpening(name)}\n${renderTree(tree, "  ")}\n${RENDERED_CONSTANT_CLOSING}`;
};
