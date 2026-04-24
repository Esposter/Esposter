import type { CacheStoreConfiguration } from "@/models/cache/indexedDb/CacheStoreConfiguration";

import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { CacheStoreName } from "@/models/cache/indexedDb/CacheStoreName";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

export const MessageCacheStoreConfiguration = {
  indexName: CompositeKeyPropertyNames.partitionKey,
  keyPath: CompositeAzureKeyPath,
  limit: 50,
  storeName: CacheStoreName.Messages,
} as const satisfies CacheStoreConfiguration;
