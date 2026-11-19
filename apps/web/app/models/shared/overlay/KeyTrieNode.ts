import type { KeyValue } from "#src/models/shared/overlay/KeyValue";

// One map level per key column, so a composite key is a path through the trie and never a string
export interface KeyTrieNode<TValue> {
  children: Map<KeyValue, KeyTrieNode<TValue>>;
  value?: TValue;
}
