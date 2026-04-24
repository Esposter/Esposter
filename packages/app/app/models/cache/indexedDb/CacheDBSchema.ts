import type { DBSchema } from "idb";

import { CacheStoreName } from "@/models/cache/indexedDb/CacheStoreName";

type CacheStoreSchema = {
  indexes: Record<string, string>;
  key: [string, string] | string;
  value: object;
};

export interface CacheDBSchema extends DBSchema {
  [CacheStoreName.Members]: CacheStoreSchema;
  [CacheStoreName.Messages]: CacheStoreSchema;
  [CacheStoreName.Rooms]: CacheStoreSchema;
}
