import type { KeyTrieNode } from "#src/models/shared/overlay/KeyTrieNode";

export const createKeyTrieNode = <TValue>(): KeyTrieNode<TValue> => ({ children: new Map() });
