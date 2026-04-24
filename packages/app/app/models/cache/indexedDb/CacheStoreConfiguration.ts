import type { CacheStoreName } from "@/models/cache/indexedDb/CacheStoreName";

export interface CacheStoreConfiguration {
  indexName: string;
  keyPath: readonly string[] | string;
  limit?: number;
  storeName: CacheStoreName;
}
