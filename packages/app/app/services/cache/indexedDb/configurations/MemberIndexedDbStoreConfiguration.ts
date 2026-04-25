import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import { PartitionedIdKeyPath } from "@/models/cache/indexedDb/keyPaths/PartitionedIdKeyPath";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

export const MemberIndexedDbStoreConfiguration = {
  indexName: CompositeKeyPropertyNames.partitionKey,
  keyPath: PartitionedIdKeyPath,
  storeName: IndexedDbStoreName.Members,
} as const satisfies IndexedDbStoreConfiguration<IndexedDbStoreName.Members>;
