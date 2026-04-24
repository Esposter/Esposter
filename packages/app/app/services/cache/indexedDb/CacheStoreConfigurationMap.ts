import type { CacheStoreConfiguration } from "@/models/cache/indexedDb/CacheStoreConfiguration";

import { CacheStoreName } from "@/models/cache/indexedDb/CacheStoreName";
import { MemberCacheStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberCacheStoreConfiguration";
import { MessageCacheStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageCacheStoreConfiguration";
import { RoomCacheStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomCacheStoreConfiguration";

export const CacheStoreConfigurationMap = {
  [CacheStoreName.Members]: MemberCacheStoreConfiguration,
  [CacheStoreName.Messages]: MessageCacheStoreConfiguration,
  [CacheStoreName.Rooms]: RoomCacheStoreConfiguration,
} as const satisfies Record<CacheStoreName, CacheStoreConfiguration>;
