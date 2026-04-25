import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

export const MessageIndexedDbStoreConfiguration = {
  indexName: CompositeKeyPropertyNames.partitionKey,
  keyPath: CompositeAzureKeyPath,
  limit: 50,
  storeName: IndexedDbStoreName.Messages,
} as const satisfies IndexedDbStoreConfiguration<IndexedDbStoreName.Messages>;
