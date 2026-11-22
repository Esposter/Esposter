import type { KeyTrieNode } from "#src/models/shared/overlay/KeyTrieNode";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// The held rows of every table, one trie per table keyed by the table's name. It is the overlay store's state, which
// Pinia carries in a server render's payload, so a client's first render holds the rows the server drew
export type HeldTables = Record<string, KeyTrieNode<Versioned>>;
