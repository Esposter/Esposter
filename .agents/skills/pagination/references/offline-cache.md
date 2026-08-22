# Offline IndexedDB list cache

Read when a list must survive going offline, or when adding/altering a feature cache composable.

Offline cache mirrors Pinia state, and it is **entirely self-contained**: `usePaginationCache` owns both directions via two watchers — items change → write IndexedDB; partition key changes **while offline** → read IndexedDB and hydrate the store. Nothing else touches the cache.

Consequences that keep this boundary intact:

- **`readItems`/`readMoreItems` know nothing about IndexedDB** — they are plain pagination helpers. Never add cache options to them or push cache behaviour deeper into pagination.
- **Read composables know nothing about the cache either** — there is no read-side cache composable to call. Never call `useOnline`, `readIndexedDb`, or `writeIndexedDb` from a feature read composable; hydration is already automatic.
- `readIndexedDb` / `writeIndexedDb` (`app/services/cache/indexedDb/`) are called **only** from `usePaginationCache`.

**Generic cache composables** (`app/composables/cache/indexedDb/`) — each takes one options object and returns nothing. Both of its operations are fired from watchers through `getSynchronizedFunction`, so the completion signal is the repo-wide drain, `waitForSynchronizedFunctions()`; never give the cache (or the `useMutation` instance under it) a `flush` of its own for a test to await.

- `usePaginationCache` — the base; takes `getSlice(partitionKey)` → `{ initializeItems, isLoaded, items }`
- `useCursorPaginationCache` / `useOffsetPaginationCache` — wrap it, taking a slice whose initializer is named `initializeCursorPaginationData` / the offset equivalent

**The cache names its partition, it does not read the ambient one.** Both watchers act on a partition key the cache already has in hand, so the store hands over `getSlice` rather than `items`/`isLoaded`: a hydrate that finishes after the reader moved on lands in the partition it was read for instead of being dropped. That is why there is no "is this still the current partition" check anywhere in here.

**Feature cache composable pattern** — a thin wrapper reading store refs and calling the generic composable:

```ts
export const useFooCache = () => {
  const fooStore = useFooStore();
  const { getSlice } = fooStore;
  useCursorPaginationCache({
    configuration: FooIndexedDbStoreConfiguration,
    getSlice,
    partitionKey: () => session.value.data?.user.id ?? "",
  });
};
```

- `configuration` — one per file, `as const satisfies IndexedDbStoreConfiguration` (a key path, plus an optional `limit`)
- `getWriteItems` — feature-specific filtering before persisting
- `onHydrate` — companion state updates after an offline hydrate (member counts, user maps)

`useMessageCache`, `useMemberCache`, `useRoomCache` are the reference shapes. Architecture doc: `packages/app/content/docs/esbabbler/offline-cache.md`.
