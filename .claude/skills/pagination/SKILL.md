---
name: pagination
description: Esposter paginated-list conventions — the three-layer cursor pagination pattern (store + useRead* composable + StyledWaypoint), infinite scroll instead of a Load-more button, server search-as-you-type via useAutoSearch/useCursorSearcher (hand-rolling banned) and its sanctioned exceptions, bundling ancillary reads into the primary read, and the offline IndexedDB pagination cache. Apply when building or reviewing a paginated list, an infinite-scroll feed, a search-as-you-type input, or an offline list cache.
---

# Pagination, Search & Offline List Cache

## Cursor Pagination — Store + Composable + Waypoint

Every paginated list follows a three-layer pattern. **Never load pages directly in a component or store a raw array for paginated data.**

### Layer 1 — Store

Call `useCursorPaginationData<TItem>()` (handles the ref + cast internally). Expose `hasMore`, `items`, `readItems`, `readMoreItems`:

```ts
export const useFooStore = defineStore("feature/foo", () => {
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<FooEntity>();
  // mutations update items.value directly (optimistic or after server response)
  return { hasMore, items, readItems, readMoreItems };
});
```

### Layer 2 — `useRead*` Composable

Wrap `readItems` (first page) and `readMoreItems` (subsequent pages) with tRPC calls. The `readMoreItems` callback receives the current `cursor` automatically. Omit `roomId` for global (non-room-scoped) lists.

```ts
export const useReadFoos = (roomId: string) => {
  const { $trpc } = useNuxtApp();
  const fooStore = useFooStore();
  const { readItems, readMoreItems } = fooStore;
  const readFoos = () => readItems(() => $trpc.foo.readFoos.query({ roomId }));
  const readMoreFoos = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.foo.readFoos.query({ cursor, roomId }), onComplete);
  return { readFoos, readMoreFoos };
};
```

### Layer 3 — Component / Page

`await readFoos()` at setup time, destructure `hasMore` + `items` via `storeToRefs`, and place `<StyledWaypoint>` at the bottom of the list (inside the container, after all items). It only triggers when `:is-active` is true, so always rendering it is safe.

```vue
<script setup lang="ts">
const { readFoos, readMoreFoos } = useReadFoos(roomId);
const fooStore = useFooStore();
const { hasMore, items } = storeToRefs(fooStore);
await readFoos();
</script>

<template>
  <v-list v-if="items.length > 0">
    <v-list-item v-for="item of items" :key="item.id" ... />
    <StyledWaypoint :is-active="hasMore" @change="readMoreFoos" />
  </v-list>
</template>
```

### Rules

- **Never** store a paginated list as a plain `ref<TItem[]>` — always `CursorPaginationData<TItem>`.
- **Never** call `readItems`/`readMoreItems` from a component directly — always via a `useRead*` composable.
- Optimistic mutations update `items.value` directly (spread for create, filter for delete) — no re-fetch.
- `readMoreItems` appends; `readItems` resets the full `CursorPaginationData` ref (handles navigating back to first page).
- Which pagination helper a store uses (single list vs per-key lists) is the `pinia` skill's ("Cursor Pagination in Stores").
- The endpoint-side input schemas are the `trpc` skill's ("Pagination Params Schemas").

### A keyed read is bound to its key when it is issued, not when it lands

`useCursorPaginationDataMap` takes a **binder**, not a ref: it resolves the current key once, up front, and the operation writes through that. So a read issued for room A files under A even when the user has already switched to B — `readItems` and `readMoreItems` give this for free and a `useRead*` composable needs nothing.

This is why the ambient `data` ref must never be assigned after an await. `useDataMap`'s setter resolves `toValue(currentId)` at **write** time, so a slower response lands under whichever key is current by then — one member's private moderation notes rendered against another member, one room's messages appended to another's.

Two corollaries that are easy to get backwards:

- **Bind per operation, never per composable.** A composable that outlives one target (`useMessageCache` is constructed once and lives across every room switch) binds to the first key and stays there forever, which is worse than not binding at all.
- **Confirm the defect before converging a call site.** A consumer that owns its own await may already re-check the key after it — `usePaginationCache` does exactly that and bails when the partition moved on. Converging it onto a binder breaks it.

`initializeCursorPaginationData` still resolves the key when called, which is correct for synchronous seeding and wrong across an await. If a new consumer needs to write after its own await, it binds at the moment that operation begins — only it knows when that was.

## StyledWaypoint — Infinite Scroll

Use `<StyledWaypoint>` for cursor-paginated lists instead of a "Load more" button. Never use a manual "Load more" `v-btn` with `isLoadingMore` state — that belongs to `StyledWaypoint`.

- `:is-active="hasMore"` — `v-show` and deactivated when there are no more pages
- `@change="readMoreXxx"` — handler must accept `(onComplete: () => void)` and call `onComplete()` when done (via the `onComplete` arg to `readMoreItems`)
- **Default slot replaces the built-in loader entirely.** The fallback is a `v-progress-circular` rendered only while loading; supplying slot content overrides it and the slot gets **no `isLoading` prop**, so passed skeletons render whenever `isActive` — not just during a fetch. Omit the slot unless you want that always-visible placeholder.

```vue
<StyledWaypoint :is-active="hasMore" @change="readMoreFoos">
  <FooSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
</StyledWaypoint>
```

## Server Search-as-You-Type — `useAutoSearch` / `useCursorSearcher` (hand-rolling BANNED)

Hand-rolling search-as-you-type around a `$trpc` search query is **banned** — no per-component `useThrottle`/`refDebounced` + `watch` + `AbortController` + `isSearching` wiring, and no `@input` handlers firing queries. That stack exists exactly once, in `useAutoSearch` (`app/composables/useAutoSearch.ts`): 1s throttle, in-flight request abort, normalized-query change detection, reset-on-empty, an `isPending` ref, and the shared `getResultAsync` → `createAlert` error surfacing from the client-data conventions (superseded/aborted requests stay silent — no consumer writes error handling).

Pick the layer by result shape:

- **Cursor-paginated results** → `useCursorSearcher(query, isAutoSearch?, isIncludeEmptySearchQuery?)` — wraps `useAutoSearch` + `useCursorPaginationData`; the query callback receives `(searchQuery, cursor, opts)` and must forward `opts` (carries the abort signal) to the tRPC call. Both flags are literal `true`-only (never `false`): the 2nd opts into auto-search, and the 3rd makes an empty query list everything (e.g. room pickers) — it only has an effect alongside the 2nd. Returns `{ hasMore, items, readItemsSearched, readMoreItemsSearched, searchQuery }`.
- **Plain array results** → `useAutoSearch(searchQuery, { reset, search })` directly; `search` receives the sanitized query and the `AbortSignal` to forward as `{ signal }`.
- **Ctrl+K palette UI** → wrap in `StyledSearchDialog` (see the `vue-component-patterns` skill).

```ts
// stores/dialogs with cursor pagination
export const useSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher((searchQuery, cursor, opts) => {
    const normalizedSearchQuery = normalizeString(searchQuery);
    return $trpc.room.readRooms.query(
      { cursor, filter: normalizedSearchQuery ? { name: normalizedSearchQuery } : undefined },
      opts,
    );
  }, true);
});

// plain array results
const { isPending } = useAutoSearch(searchQuery, {
  reset: () => {
    searchResults.value = [];
  },
  search: async (sanitizedSearchQuery, signal) => {
    searchResults.value = await $trpc.friend.searchUsers.query(sanitizedSearchQuery, { signal });
  },
});
```

The only sanctioned exceptions (documented in `docs/architecture/search.md`):

- **`v-data-table-server` lists** — the table owns fetch orchestration via its `search` prop + `@update:options`; feed it a `refDebounced(searchQuery, …)`.
- **Explicit-submit search** — Enter-triggered with filters and search history; no as-you-type querying to throttle.
- **Client-index search** — MiniSearch/computed over already-loaded data; no server call, so a plain `computed` (optionally `refDebounced`) suffices.

Anything else that looks like a new exception should be refactored onto `useAutoSearch` instead.

## Bundle Ancillary Reads with the Primary Read

When a component needs ancillary data (permissions, metadata) alongside a primary list load, bundle the ancillary read inside the primary read composable — not in the component's `onMounted`. `readMyPermissions` and similar belong inside the composable owning the load (`useReadRooms`, `useReadMembers`), called in `Promise.all` alongside other metadata reads. If there is no natural companion read, call it directly in `<script setup>` — still no `onMounted`.

```typescript
// bundle ancillary reads in the owning read composable — not a separate component onMounted fetch
const readMyUsersToRooms = useReadMyUsersToRooms();
const readMyPermissions = useReadMyPermissions();
const readRoles = useReadRoles();
const readRooms = () =>
  readItems(async () => {
    const data = await $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {});
    const roomIds = data.items.map(({ id }) => id);
    if (roomIds.length > 0)
      await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
    return data;
  });
```

Follow the `useReadMyUsersToRooms` pattern for batch ancillary reads — a composable taking an **array** of ids, early-returning when it is empty, and issuing one batched query rather than N per-id calls.

## Offline IndexedDB Cache via Pagination Cache Composables

Offline cache mirrors Pinia state, and it is **entirely self-contained**: `usePaginationCache` owns both directions via two watchers — items change → write IndexedDB; partition key changes **while offline** → read IndexedDB and hydrate the store. Nothing else touches the cache.

Consequences that keep this boundary intact:

- **`readItems`/`readMoreItems` know nothing about IndexedDB** — they are plain pagination helpers. Never add cache options to them or push cache behaviour deeper into pagination.
- **Read composables know nothing about the cache either** — there is no read-side cache composable to call. Never call `useOnline`, `readIndexedDb`, or `writeIndexedDb` from a feature read composable; hydration is already automatic.
- `readIndexedDb` / `writeIndexedDb` (`app/services/cache/indexedDb/`) are called **only** from `usePaginationCache`.

**Generic cache composables** (`app/composables/cache/indexedDb/`) — both take one options object and return `{ flush }`:

- `usePaginationCache` — the base; takes `initializeItems`
- `useCursorPaginationCache` / `useOffsetPaginationCache` — wrap it, taking `initializeCursorPaginationData` / the offset equivalent instead

**Feature cache composable pattern** — a thin wrapper reading store refs and returning the generic composable:

```ts
export const useFooCache = () => {
  const fooStore = useFooStore();
  const { foos } = storeToRefs(fooStore);
  const { initializeCursorPaginationData } = fooStore;
  return useCursorPaginationCache({
    configuration: FooIndexedDbStoreConfiguration,
    initializeCursorPaginationData,
    items: foos,
    partitionKey: () => session.value.data?.user.id ?? "",
  });
};
```

- `configuration` — one per file, `as const satisfies IndexedDbStoreConfiguration` (a key path, plus an optional `limit`)
- `getWriteItems` — feature-specific filtering before persisting
- `onHydrate` — companion state updates after an offline hydrate (member counts, user maps)
- `flush()` — returned so tests can await the pending write

`useMessageCache`, `useMemberCache`, `useRoomCache` are the reference shapes. Architecture doc: `packages/app/content/docs/esbabbler/offline-cache.md`.
