import type { KeyTrieNode } from "#src/models/shared/overlay/KeyTrieNode";
import type { KeyValue } from "#src/models/shared/overlay/KeyValue";
import type { RowKey } from "#src/models/shared/overlay/RowKey";

// Every value held under the trie with its key, the path of its column values
export const listKeyTrie = <TValue>(node: KeyTrieNode<TValue>, path: KeyValue[] = []): [RowKey, TValue][] => {
  const entries: [RowKey, TValue][] = [];
  if (node.value !== undefined) entries.push([path, node.value]);
  for (const [part, child] of node.children) entries.push(...listKeyTrie(child, [...path, part]));
  return entries;
};
