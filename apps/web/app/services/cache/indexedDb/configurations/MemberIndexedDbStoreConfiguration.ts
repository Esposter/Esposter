import type { IndexedDbStoreConfiguration } from "#src/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "#src/models/cache/indexedDb/IndexedDbStoreName";

export const MemberIndexedDbStoreConfiguration = {
  indexName: "roomId",
  keyPath: ["roomId", "id"],
  storeName: IndexedDbStoreName.Members,
} as const satisfies IndexedDbStoreConfiguration<typeof IndexedDbStoreName.Members>;
