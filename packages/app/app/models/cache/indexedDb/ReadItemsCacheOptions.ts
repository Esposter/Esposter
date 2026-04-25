import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

export interface ReadItemsCacheOptions<T extends IndexedDbStoreName> {
  configuration: IndexedDbStoreConfiguration<T>;
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, IndexNames<IndexedDbDatabaseSchema, T>>;
}
