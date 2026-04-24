# Offline Cache (IndexedDB)

IndexedDB-backed offline cache for per-room data. When the user is offline and switches rooms, composables fall back to cached data automatically.

## Structure

```
models/cache/indexedDb/
  CacheStoreName.ts              — enum (PascalCase values: Messages, Members, Rooms)
  CacheStoreConfiguration.ts    — interface: storeName, keyPath, indexName (required), limit?
  CacheDBSchema.ts               — idb typed schema used by openCacheDatabase
  keyPaths/
    CompositeAzureKeyPath.ts     — ["partitionKey", "rowKey"] for Azure entities
    PartitionedIdKeyPath.ts      — ["partitionKey", "id"] for AItemEntity with injected partition

services/cache/indexedDb/
  configurations/
    MessageCacheStoreConfiguration.ts
    MemberCacheStoreConfiguration.ts
    RoomCacheStoreConfiguration.ts
  CacheStoreConfigurationMap.ts  — Record<CacheStoreName, CacheStoreConfiguration>
  openCacheDatabase.ts           — singleton IDBPDatabase; creates all stores from the map
  readCached.ts                  — readCached<T>(config, partitionKey): Promise<T[]>
  writeCached.ts                 — writeCached<T>(config, items, partitionKey): Promise<void>
  readCached.test.ts             — tests for base read/write functions only
```

## Conventions

**`indexName` is always required.** Every store is partitioned. `partitionKey` is required on every `readCached`/`writeCached` call.

**Partition keys by entity:**

- Messages: `roomId` (MessageEntity already has `partitionKey` field)
- Members: `roomId` (inject `{ ...user, partitionKey: roomId }` when writing; strip when reading)
- Rooms: `userId` (inject `{ ...room, partitionKey: userId }` when writing; strip when reading)

**Target composables** — any `useRead*` that fires on `currentRoomId` change:

- Read path: check `online.value`; if offline return `readCached(config, partitionKey)` in a `CursorPaginationData`
- Write path: `await writeCached(config, items.map(item => ({ ...item, partitionKey })), partitionKey)` after a successful online fetch

**Tests:** test `readCached`/`writeCached` directly against `MessageCacheStoreConfiguration`. No per-composable cache tests.

## Adding a new cached entity

1. Add a value to `CacheStoreName`
2. Add a key path constant to `keyPaths/` if not already present
3. Create `*CacheStoreConfiguration.ts` in `services/cache/indexedDb/configurations/`
4. Register in `CacheStoreConfigurationMap`
5. Bump `CACHE_DATABASE_VERSION` in `openCacheDatabase` (required for new IDB stores)
6. Add offline fallback + write-after-fetch to the relevant `useRead*` composable
