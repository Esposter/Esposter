# Esbabbler — Offline IndexedDB Cache

## Overview

Room-switch composables (`useReadMessages`, `useReadMembers`, `useReadRooms`) cache their fetched data in IndexedDB so the app can function offline. The cache is transparent — each composable passes `ReadItemsCacheOptions` to `readItems`, which handles read/write internally.

## Architecture

### Models

| File                                                           | Purpose                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| `app/models/cache/indexedDb/IndexedDbStoreName.ts`             | Enum of object store names (`Members`, `Messages`, `Rooms`) |
| `app/models/cache/indexedDb/IndexedDbStoreConfiguration.ts`    | Interface: `{ storeName, keyPath, indexName, limit? }`      |
| `app/models/cache/indexedDb/IndexedDbDatabaseSchema.ts`        | Typed `DBSchema` (from `idb`) for all stores                |
| `app/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath.ts` | `[partitionKey, rowKey]` — for Azure Table entities         |
| `app/models/cache/indexedDb/keyPaths/PartitionedIdKeyPath.ts`  | `[partitionKey, id]` — for injected-partitionKey entities   |
| `app/models/pagination/cursor/ReadItemsCacheOptions.ts`        | Cache parameter for `readItems`                             |

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

- **Messages** → `roomId` (entity already has `partitionKey` field)
- **Members** → `roomId` (inject `{ ...user, partitionKey: roomId }` on write, strip on read)
- **Rooms** → `userId` (inject `{ ...room, partitionKey: userId }` on write, strip on read)

## Pattern: `readItems` with `ReadItemsCacheOptions`

`readItems` in `useCursorPaginationOperationData` accepts an optional third argument. When provided and the user is offline, it reads from the cache instead of calling the tRPC query. When online, it writes the fetched data back to the cache after every successful query.

```typescript
interface ReadItemsCacheOptions<TItem> {
  cache: {
    read: (partitionKey: string) => Promise<TItem[]>;
    write: (items: TItem[], partitionKey: string) => Promise<void>;
  };
  onCacheRead?: () => void; // called only on offline cache hit (e.g. reset pagination state)
  partitionKey: string;
}
```

**Usage in composables:**

```typescript
// useReadMessages.ts — partitionKey = roomId, entity has partitionKey natively
readItems(
  () => $trpc.message.readMessages.query({ roomId }),
  ({ items }) => readMetadata(items),
  {
    cache: {
      read: (partitionKey) => readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey),
      write: (items, partitionKey) => writeIndexedDb(MessageIndexedDbStoreConfiguration, items, partitionKey),
    },
    onCacheRead: () => {
      hasMoreNewer.value = false;
      nextCursorNewer.value = undefined;
    },
    partitionKey: roomId,
  },
);

// useReadMembers.ts — partitionKey = roomId, inject partitionKey (User has no partitionKey)
readItems(
  () => $trpc.room.readMembers.query({ roomId }),
  ...,
  {
    cache: {
      read: (partitionKey) => readIndexedDb(MemberIndexedDbStoreConfiguration, partitionKey),
      write: (items, partitionKey) => writeIndexedDb(MemberIndexedDbStoreConfiguration, items, partitionKey),
    },
    partitionKey: roomId,
  },
);
```

## Additional: `useMessageCache`

`useMessageCache` supplements `readItems` with two extra behaviors that `readItems` cannot handle on its own:

1. **`watchDeep(items, ...)`** — writes to IndexedDB whenever the in-memory message list changes (e.g., new messages via tRPC subscription)
2. **`watch(currentRoomId, ...)`** — when offline and the user switches rooms, hydrates the store from IndexedDB (since the Messages component doesn't re-mount on room change)

This is the only composable that needs both a reactive watcher and a room-switch watcher. All other room-switch composables are fully covered by the `readItems` cacheOptions pattern.

## Tests

`app/services/cache/indexedDb/readIndexedDb.test.ts` — tests for `readIndexedDb` / `writeIndexedDb` using `MessageIndexedDbStoreConfiguration`:

- empty read returns `[]`
- write then read returns items
- reads only items for the requested `partitionKey`
- re-write replaces existing items
- write respects the `limit`

`fake-indexeddb/auto` is loaded in `vitest.config.ts` `setupFiles` — no mocking needed.
