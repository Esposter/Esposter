import type { DatabaseIndexName } from "@esposter/shared";
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";

export interface IndexedDbStoreConfiguration<
  T extends IndexedDbStoreName,
  TIndex extends DatabaseIndexName<IndexedDbDatabaseSchema, T> = DatabaseIndexName<IndexedDbDatabaseSchema, T>,
> {
  indexName: TIndex;
  keyPath: IndexedDbDatabaseSchema[T]["key"];
  limit?: number;
  storeName: T;
}
