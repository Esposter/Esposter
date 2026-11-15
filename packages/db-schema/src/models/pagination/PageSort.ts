import type { SortOrder } from "#src/models/pagination/SortOrder";

// A list's order, as data both sides read: the keys it compares, in order, and the one direction they all run. The last
// Key is unique, so the order is total and rows that tie on the others never fall across a page boundary unordered. The
// Server binds each key to a column (createPageSort); the client never sends an order, only, where a list offers a
// Choice, the name of one
export interface PageSort<TKey extends string = string> {
  keys: readonly [TKey, ...TKey[]];
  order: SortOrder;
}
