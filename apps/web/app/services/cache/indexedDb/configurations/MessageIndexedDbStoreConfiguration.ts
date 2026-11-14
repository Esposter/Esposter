import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";

export const MessageIndexedDbStoreConfiguration = {
  indexName: "roomId",
  keyPath: ["roomId", "id"],
  limit: 50,
  storeName: IndexedDbStoreName.Messages,
} as const satisfies IndexedDbStoreConfiguration<IndexedDbStoreName.Messages>;
