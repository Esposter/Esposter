import type { IndexedDbStoreConfiguration } from "#src/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "#src/models/cache/indexedDb/IndexedDbStoreName";

// A room list is the rooms one user belongs to, so its rows are partitioned by that user. `userId` is not used: it is
// The room's own creator, a field a room row already carries
export const RoomIndexedDbStoreConfiguration = {
  indexName: "viewerId",
  keyPath: ["viewerId", "id"],
  storeName: IndexedDbStoreName.Rooms,
} as const satisfies IndexedDbStoreConfiguration<typeof IndexedDbStoreName.Rooms>;
