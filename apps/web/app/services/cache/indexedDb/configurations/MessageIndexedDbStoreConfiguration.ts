import type { IndexedDbStoreConfiguration } from "#src/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "#src/models/cache/indexedDb/IndexedDbStoreName";

export const MessageIndexedDbStoreConfiguration = {
  indexName: "roomId",
  keyPath: ["roomId", "id"],
  limit: 50,
  storeName: IndexedDbStoreName.Messages,
} as const satisfies IndexedDbStoreConfiguration<typeof IndexedDbStoreName.Messages>;
