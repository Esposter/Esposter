import type { CacheStoreConfiguration } from "@/models/cache/indexedDb/CacheStoreConfiguration";

import { PartitionedIdKeyPath } from "@/models/cache/indexedDb/keyPaths/PartitionedIdKeyPath";
import { CacheStoreName } from "@/models/cache/indexedDb/CacheStoreName";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

export const MemberCacheStoreConfiguration = {
  indexName: CompositeKeyPropertyNames.partitionKey,
  keyPath: PartitionedIdKeyPath,
  storeName: CacheStoreName.Members,
} as const satisfies CacheStoreConfiguration;
