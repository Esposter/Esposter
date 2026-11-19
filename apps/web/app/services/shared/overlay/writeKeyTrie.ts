import type { KeyTrieNode } from "#src/models/shared/overlay/KeyTrieNode";
import type { RowKey } from "#src/models/shared/overlay/RowKey";

import { createKeyTrieNode } from "#src/services/shared/overlay/createKeyTrieNode";
import { getOrCreate } from "@esposter/shared";

export const writeKeyTrie = <TValue>(root: KeyTrieNode<TValue>, key: RowKey, value: TValue): void => {
  let node = root;
  for (const part of key) node = getOrCreate(node.children, part, () => createKeyTrieNode<TValue>());
  node.value = value;
};
