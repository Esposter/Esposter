# Offline IndexedDB list cache

Read when a list must survive going offline, or when adding/altering a feature cache composable.

Offline cache mirrors Pinia state, and it is **entirely self-contained**: `usePaginationCache` owns both directions via two watchers — items change → write IndexedDB; partition key changes **while offline** → read IndexedDB and hydrate the store. Nothing else touches the cache.

Consequences that keep this boundary intact:

- **`readItems`/`readMoreItems` know nothing about IndexedDB** — they are plain pagination helpers. Never add cache options to them or push cache behaviour deeper into pagination.
- **Read composables know nothing about the cache either** — there is no read-side cache composable to call. Never call `useOnline`, `readIndexedDb`, or `writeIndexedDb` from a feature read composable; hydration is already automatic.
- `readIndexedDb` / `writeIndexedDb` (`apps/web/app/services/cache/indexedDb/`) are called **only** from `usePaginationCache`.
- **Sign-out deletes the whole database** (`apps/web/app/services/auth/signOutOfBrowser.ts`), which is what stops room-keyed messages and members reaching the next reader of the browser. A store keyed by anything other than the reader relies on that delete.

**The generic cache composable** (`apps/web/app/composables/cache/indexedDb/usePaginationCache.ts`) takes one options object and returns nothing. Both of its operations are fired from watchers through `getSynchronizedFunction`, so the completion signal is the repo-wide drain, `waitForSynchronizedFunctions()`; never give the cache (or the `useMutation` instance under it) a `flush` of its own for a test to await.

`usePaginationCache` takes `getSlice(partitionKey)`, which returns a `CursorPaginationSlice` (`{ initializeCursorPaginationData, isLoaded, items, resetCursorPaginationData }`). The cache persists the slice's `items`, which are full rows, and a restore hands `initializeCursorPaginationData` a page of **full rows, never ids**; the store decides how those rows land.

**A store whose rows live on the overlay restores them through `arrive`.** Its `items` is then the overlay's live view, and `initializeCursorPaginationData` arrives each cached row at its version, then keeps only the page's ids for paging, the same split the reads make. A restore that writes the ids alone leaves the list empty offline, since a row is not in the view until it is arrived. A list with no cursor, such as the viewer's memberships in the room cache, has no ids to keep: its restore arrives the rows and sets its readiness, and its `items` is the viewer's live view.

**Each list in a cache keeps its own readiness flag.** A feature cache with two lists over one partition (`useRoomCache` wires the rooms and the viewer's memberships) gives each its own `isLoaded`, owned by the store that loads it. A hydration of one must not read the other's flag: both restore in the same tick, and whichever lands first would make the other bail.

**The cache names its partition, it does not read the ambient one.** Both watchers act on a partition key the cache already has in hand, so the store hands over `getSlice` rather than `items`/`isLoaded`: a hydrate that finishes after the reader moved on lands in the partition it was read for instead of being dropped. That is why there is no "is this still the current partition" check anywhere in here.

**Feature cache composable pattern** — a thin wrapper reading store refs and calling the generic composable:

```ts
export const useFooCache = () => {
  const fooStore = useFooStore();
  const { getSlice } = fooStore;
  usePaginationCache({
    configuration: FooIndexedDbStoreConfiguration,
    getSlice,
    partitionKey: () => session.value.data?.user.id ?? "",
  });
};
```

- `configuration` — one per file, `as const satisfies IndexedDbStoreConfiguration` (a key path, plus an optional `limit`)
- `getWriteItems` — feature-specific filtering before persisting
- `onHydrate` — companion state updates after an offline hydrate (member counts, user maps)

`useMessageCache`, `useMemberCache`, `useRoomCache` are the reference shapes. Architecture doc: `openspec/specs/esbabbler/offline-cache/design.md`.
