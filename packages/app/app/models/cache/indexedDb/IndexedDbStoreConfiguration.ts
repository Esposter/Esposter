import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";

export interface IndexedDbStoreConfiguration<T extends IndexedDbStoreName> {
  indexName: string;
  keyPath: readonly string[] | string;
  limit?: number;
  storeName: T;
}
