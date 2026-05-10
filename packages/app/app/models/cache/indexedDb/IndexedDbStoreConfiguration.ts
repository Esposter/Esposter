import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexNames } from "idb";

export interface IndexedDbStoreConfiguration<
  T extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, T> = IndexNames<IndexedDbDatabaseSchema, T>,
> {
  indexName: TIndex;
  keyPath: IndexedDbDatabaseSchema[T]["key"];
  limit?: number;
  storeName: T;
}
