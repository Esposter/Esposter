# Esbabbler — Offline IndexedDB Cache

## Overview

Offline cache should be boring: the Pinia store remains the source of truth, and a small cache composable mirrors store items to IndexedDB with `watchDeep`. Fetch composables load data from tRPC when online and hydrate from IndexedDB only when offline.

Avoid threading cache behavior through pagination helpers. `readItems` / `readMoreItems` should stay focused on cursor pagination and server reads; cache writes belong beside the store data they mirror.

## Architecture

### Models

| File                                                           | Purpose                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| `app/models/cache/indexedDb/IndexedDbStoreName.ts`             | Enum of object store names (`Members`, `Messages`, `Rooms`) |
| `app/models/cache/indexedDb/IndexedDbStoreConfiguration.ts`    | Interface: `{ storeName, keyPath, indexName, limit? }`      |
| `app/models/cache/indexedDb/IndexedDbDatabaseSchema.ts`        | Typed `DBSchema` (from `idb`) for all stores                |
| `app/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath.ts` | `[partitionKey, rowKey]` — for Azure Table entities         |
| `app/models/cache/indexedDb/keyPaths/PartitionedIdKeyPath.ts`  | `[partitionKey, id]` — for injected-partitionKey entities   |

`ReadItemsCacheOptions` has been removed. Do not reintroduce cache parameters to `readItems`; cache behavior belongs in feature-level cache composables.

### Services

| File                                                                                | Purpose                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `app/services/cache/indexedDb/openIndexedDb.ts`                                     | Singleton `openDB` + `resetIndexedDb` (for tests)         |
| `app/services/cache/indexedDb/readIndexedDb.ts`                                     | Read all items by `partitionKey` from a store             |
| `app/services/cache/indexedDb/writeIndexedDb.ts`                                    | Replace all items for a `partitionKey` (respects `limit`) |
| `app/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration.ts` | Messages config: CompositeAzureKeyPath, limit 50          |
| `app/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration.ts`  | Members config: PartitionedIdKeyPath                      |
| `app/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration.ts`    | Rooms config: PartitionedIdKeyPath                        |

### Key Principle: partitionKey is Always Required

Every store is partitioned. `readIndexedDb` / `writeIndexedDb` always take an explicit `partitionKey` string:

- **Messages** -> `roomId` (entity already has `partitionKey` field)
- **Members** -> `roomId` (IndexedDB value includes an injected `partitionKey`)
- **Rooms** -> `userId` (IndexedDB value includes an injected `partitionKey`)

## Recommended Pattern: Watch the Store

Each offline-backed feature gets a cache composable that:

1. reads the relevant Pinia store refs with `storeToRefs`
2. `watchDeep`s the items and writes the current partition to IndexedDB
3. watches the partition key and hydrates the store from IndexedDB when offline
4. filters transient UI-only records before writing, such as `isLoading` messages
5. queues writes with a `pendingOperation` promise when ordering matters

```typescript
export const useFooCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const fooStore = useFooStore();
  const { items } = storeToRefs(fooStore);
  const { initializeCursorPaginationData } = fooStore;
  const online = useOnline();
  let pendingOperation: Promise<void> = Promise.resolve();

  watchDeep(items, (newItems) => {
    const roomId = currentRoomId.value;
    if (!roomId) return;
    const previousOperation = pendingOperation;
    pendingOperation = getResultAsync(async () => {
      await previousOperation;
      await writeIndexedDb(FooIndexedDbStoreConfiguration, newItems, roomId);
    }).match(noop, console.error);
  });

  watch(currentRoomId, (newRoomId) => {
    if (!newRoomId || online.value) return;
    const previousOperation = pendingOperation;
    pendingOperation = getResultAsync(async () => {
      await previousOperation;
      const cachedItems = await readIndexedDb(FooIndexedDbStoreConfiguration, newRoomId);
      if (currentRoomId.value !== newRoomId || cachedItems.length === 0) return;

      const cachedData = new CursorPaginationData<Foo>();
      cachedData.items = cachedItems;
      initializeCursorPaginationData(cachedData);
    }).match(noop, console.error);
  });

  return { flush: () => pendingOperation };
};
```

Messages, members, and rooms follow this shape through their `use*Cache` composables.

## Fetch Composables

`useReadMessages`, `useReadMembers`, and `useReadRooms` should be plain read composables:

- online: call tRPC, initialize pagination data, and load metadata
- offline: read cached items for the current partition and initialize the store
- pagination: `readMoreItems` should no-op offline because IndexedDB stores the current cached window, not the full remote cursor history

Do not write IndexedDB from `readItems`, `readMoreItems`, or metadata callbacks. Once the store is initialized, the cache watcher writes the same state through one consistent path.

## Why This Is Simpler

- One owner writes each cache: the feature cache composable.
- Subscription updates, optimistic updates, first-page reads, and pagination all flow through the same `watchDeep` write path.
- Cursor pagination helpers stop knowing about IndexedDB, store names, online state, and database schema casts.
- Offline hydration is explicit at the feature boundary, where partition keys and metadata behavior are already known.

## Tests

Keep service tests around the generic IndexedDB helpers:

- empty read returns `[]`
- write then read returns items
- reads only items for the requested `partitionKey`
- re-write replaces existing items
- write respects the `limit`

Cache composable tests should cover the feature behavior:

- store item changes write to IndexedDB
- transient UI-only records are not persisted
- offline partition changes hydrate the store from IndexedDB
- online partition changes do not overwrite fresh server reads with cached data
- `flush()` waits for queued writes

`fake-indexeddb/auto` is loaded in `vitest.config.ts` `setupFiles` — no mocking needed.
