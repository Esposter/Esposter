# Esbabbler — Offline IndexedDB Cache

## Overview

Offline cache is a local mirror of Pinia state. The stores remain the source of truth; generic IndexedDB cache composables handle online/offline branching, store-to-cache writes, and offline hydration.

`readItems` / `readMoreItems` stay focused on pagination state. They should not accept cache options or call IndexedDB.

## Architecture

### Models

| File                                                           | Purpose                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| `app/models/cache/indexedDb/IndexedDbStoreName.ts`             | Enum of object store names (`Members`, `Messages`, `Rooms`) |
| `app/models/cache/indexedDb/IndexedDbStoreConfiguration.ts`    | Interface: `{ storeName, keyPath, indexName, limit? }`      |
| `app/models/cache/indexedDb/IndexedDbDatabaseSchema.ts`        | Typed `DBSchema` (from `idb`) for all stores                |
| `app/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath.ts` | `[partitionKey, rowKey]` — for Azure Table entities         |
| `app/models/cache/indexedDb/keyPaths/PartitionedIdKeyPath.ts`  | `[partitionKey, id]` — for injected-partitionKey entities   |

`ReadItemsCacheOptions` has been removed. Do not reintroduce cache parameters to pagination helpers.

### IndexedDB Services

| File                                                                                | Purpose                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `app/services/cache/indexedDb/openIndexedDb.ts`                                     | Singleton `openDB` + `resetIndexedDb` (for tests)         |
| `app/services/cache/indexedDb/readIndexedDb.ts`                                     | Read all items by `partitionKey` from a store             |
| `app/services/cache/indexedDb/writeIndexedDb.ts`                                    | Replace all items for a `partitionKey` (respects `limit`) |
| `app/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration.ts` | Messages config: CompositeAzureKeyPath, limit 50          |
| `app/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration.ts`  | Members config: PartitionedIdKeyPath                      |
| `app/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration.ts`    | Rooms config: PartitionedIdKeyPath                        |

### Cache Composables

| File                                                              | Purpose                                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `app/composables/cache/indexedDb/useCursorPaginationCache.ts`     | Watches cursor-paginated store items, writes IndexedDB, hydrates offline changes |
| `app/composables/cache/indexedDb/useReadCursorPaginationCache.ts` | Wraps first-page cursor reads: online query, offline IndexedDB read              |
| `app/composables/cache/indexedDb/useOffsetPaginationCache.ts`     | Offset-paginated equivalent of `useCursorPaginationCache`                        |
| `app/composables/cache/indexedDb/useReadOffsetPaginationCache.ts` | Offset-paginated equivalent of `useReadCursorPaginationCache`                    |
| `app/composables/message/message/useMessageCache.ts`              | Message-specific wiring: room partition, loading-message filter                  |
| `app/composables/message/room/useMemberCache.ts`                  | Member-specific wiring: room partition, count/user-store hydration               |
| `app/composables/message/room/useRoomCache.ts`                    | Room-specific wiring: user partition                                             |

### Key Principle: partitionKey is Always Required

Every store is partitioned. `readIndexedDb` / `writeIndexedDb` always take an explicit `partitionKey` string:

- **Messages** -> `roomId` (entity already has `partitionKey` field)
- **Members** -> `roomId` (IndexedDB value includes an injected `partitionKey`)
- **Rooms** -> `userId` (IndexedDB value includes an injected `partitionKey`)

## Recommended Pattern: Generic Cache Wrapper

Feature cache composables should be thin wrappers around `useCursorPaginationCache` or `useOffsetPaginationCache`.

```typescript
export const useFooCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const fooStore = useFooStore();
  const { items } = storeToRefs(fooStore);
  const { initializeCursorPaginationData } = fooStore;

  return useCursorPaginationCache({
    configuration: FooIndexedDbStoreConfiguration,
    getWriteItems: (items) => items.filter((item) => !item.isLoading),
    initializeCursorPaginationData,
    items,
    onHydrate: (cachedItems) => {
      // Optional: update related store data or counts.
    },
    partitionKey: currentRoomId,
  });
};
```

Use `getWriteItems` only for feature-specific filtering or projection. Use `onHydrate` only for side effects that are not represented by the paginated store itself, such as member counts or companion user maps.

## Recommended Pattern: Cached First Read

Fetch composables should call `useReadCursorPaginationCache` or `useReadOffsetPaginationCache` inside their `readItems` query function. That helper owns `useOnline` and returns cached pagination data offline.

```typescript
export const useReadFoos = () => {
  const { $trpc } = useNuxtApp();
  const fooStore = useFooStore();
  const { readItems } = fooStore;
  const readFooCache = useReadCursorPaginationCache(FooIndexedDbStoreConfiguration);

  const readFoos = (roomId: string) =>
    readItems(() =>
      readFooCache(roomId, async () => {
        const data = await $trpc.foo.readFoos.query({ roomId });
        await readFooMetadata(data.items);
        return data;
      }),
    );

  return { readFoos };
};
```

Online metadata reads belong inside the online query passed to the cache helper. Offline reads should only initialize from cached items unless the metadata is also locally cached.

## Why This Is Simpler

- One generic owner handles IndexedDB writes, offline hydration, `useOnline`, and queued cache operations.
- Feature cache composables only supply partition keys, store refs, and feature-specific hooks.
- `readItems` / `readMoreItems` remain plain pagination helpers.
- Cursor and offset pagination now share the same cache convention.

## Tests

Keep service tests around the generic IndexedDB helpers:

- empty read returns `[]`
- write then read returns items
- reads only items for the requested `partitionKey`
- re-write replaces existing items
- write respects the `limit`

Feature cache tests should cover feature-specific behavior:

- store item changes write to IndexedDB
- transient UI-only records are not persisted
- offline partition changes hydrate the store from IndexedDB
- feature hydration side effects run, such as member count updates
- `flush()` waits for queued writes

`fake-indexeddb/auto` is loaded in `vitest.config.ts` `setupFiles` — no mocking needed.
