import type { IndexedDbStoreConfiguration } from "#src/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { IndexedDbStoreName } from "#src/models/cache/indexedDb/IndexedDbStoreName";

// A viewer's memberships are partitioned by that viewer, whose id every membership row carries as its own userId
export const UserToRoomIndexedDbStoreConfiguration = {
  indexName: "userId",
  keyPath: ["userId", "roomId"],
  storeName: IndexedDbStoreName.UserToRooms,
} as const satisfies IndexedDbStoreConfiguration<typeof IndexedDbStoreName.UserToRooms>;
