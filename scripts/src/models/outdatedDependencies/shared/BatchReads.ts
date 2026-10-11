// The values of a batched read, and the message of each item whose read failed
export interface BatchReads<TItem, TValue> {
  errors: Map<TItem, string>;
  values: Map<TItem, TValue>;
}
