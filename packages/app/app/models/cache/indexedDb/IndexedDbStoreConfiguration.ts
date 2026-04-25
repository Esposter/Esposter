import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexNames } from "idb";

export interface IndexedDbStoreConfiguration<T extends IndexedDbStoreName> {
  indexName: IndexNames<IndexedDbDatabaseSchema, T>;
  keyPath: readonly string[] | string;
  limit?: number;
  storeName: T;
}
