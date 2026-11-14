export interface IndexedDbStoreSchema<TItem extends object> {
  // Index keys are strings so a partition doubles as a `useMutation` target verbatim — a wider `IDBValidKey`
  // Would have to be stringified to become one, and `String()` collapses distinct keys (`"1,2"` and `[1, 2]`)
  // Onto a single target
  indexes: Record<string, string>;
  key: IDBValidKey;
  value: TItem;
}
