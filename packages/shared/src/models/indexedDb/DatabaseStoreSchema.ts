export interface DatabaseStoreSchema {
  indexes: Record<string, IDBValidKey>;
  key: IDBValidKey;
  value: unknown;
}
