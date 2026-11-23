import { createKeyTreeNode } from "#src/internal/services/createKeyTreeNode";
import { insertKey } from "#src/internal/services/insertKey";
import { renderTree } from "#src/internal/services/renderTree";
import { RENDERED_CONSTANT_CLOSING } from "#src/services/renderConstantClosing";
import { renderConstantOpening } from "#src/services/renderConstantOpening";

export const renderConstant = (name: string, pairs: [name: string, lockKey: string][]): string => {
  const tree = createKeyTreeNode();
  const names = new Set<string>();
  for (const [keyName, lockKey] of pairs) {
    // The renderer runs from `nuxt prepare` before any workspace package is built, so it cannot
    // oxlint-disable-next-line error-handling/no-bare-error -- import InvalidOperationError from @esposter/shared
    if (names.has(keyName)) throw new Error(`${keyName} is derived by two lock keys, so it names only one of them`);
    names.add(keyName);
    insertKey(tree, keyName, lockKey);
  }
  const body = renderTree(tree, "  ");
  // An empty constant is one line, as the formatter writes an empty object
  if (!body) return `${renderConstantOpening(name)}${RENDERED_CONSTANT_CLOSING}`;
  return `${renderConstantOpening(name)}\n${body}\n${RENDERED_CONSTANT_CLOSING}`;
};
