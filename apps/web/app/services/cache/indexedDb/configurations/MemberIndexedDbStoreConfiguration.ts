import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";

export const MemberIndexedDbStoreConfiguration = {
  indexName: "roomId",
  keyPath: ["roomId", "id"],
  storeName: IndexedDbStoreName.Members,
} as const satisfies IndexedDbStoreConfiguration<IndexedDbStoreName.Members>;
