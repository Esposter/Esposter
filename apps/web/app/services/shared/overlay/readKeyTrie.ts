import type { KeyTrieNode } from "#src/models/shared/overlay/KeyTrieNode";
import type { RowKey } from "#src/models/shared/overlay/RowKey";

export const readKeyTrie = <TValue>(root: KeyTrieNode<TValue>, key: RowKey): TValue | undefined => {
  let node = root;
  for (const part of key) {
    const child = node.children.get(part);
    if (!child) return undefined;

    node = child;
  }
  return node.value;
};
