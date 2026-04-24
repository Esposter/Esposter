import type { CacheStoreConfiguration } from "@/models/cache/indexedDb/CacheStoreConfiguration";

import { PartitionedIdKeyPath } from "@/models/cache/indexedDb/keyPaths/PartitionedIdKeyPath";
import { CacheStoreName } from "@/models/cache/indexedDb/CacheStoreName";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

export const RoomCacheStoreConfiguration = {
  indexName: CompositeKeyPropertyNames.partitionKey,
  keyPath: PartitionedIdKeyPath,
  storeName: CacheStoreName.Rooms,
} as const satisfies CacheStoreConfiguration;
