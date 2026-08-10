---
name: pagination
description: Esposter paginated-list conventions — the three-layer cursor pagination pattern (store + useRead* composable + StyledWaypoint), a keyed read binding to its key when issued, infinite scroll instead of a Load-more button, the ban on hand-rolling search-as-you-type, bundling ancillary reads into the primary read, and the offline IndexedDB cache being self-contained, plus deep dives on wiring useAutoSearch/useCursorSearcher with its sanctioned exceptions and on the feature cache composables. Apply when building or reviewing a paginated list, an infinite-scroll feed, a search-as-you-type input, or an offline list cache.
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
- Which pagination helper a store uses (single list vs per-key lists) is the `pinia` skill's (`references/keyed-state-and-pagination.md`).
- The endpoint-side input schemas are the `trpc` skill's (`references/read-endpoints.md`).

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
- **Its observer is deliberately never torn down.** `v-show` already hides an exhausted waypoint, and an `IntersectionObserver` on a `display: none` element reports not-intersecting and simply stops firing — so gating `useElementVisibility` on `isActive` (a `watchEffect` that re-observes, a `v-if` in place of the `v-show`) buys no work back and adds a re-observation race on the way in. Leave the observer alive for the component's life; this is the general rule in the `vue-composable-patterns` skill.
- **Default slot replaces the built-in loader entirely.** The fallback is a `v-progress-circular` rendered only while loading; supplying slot content overrides it and the slot gets **no `isLoading` prop**, so passed skeletons render whenever `isActive` — not just during a fetch. Omit the slot unless you want that always-visible placeholder.

```vue
<StyledWaypoint :is-active="hasMore" @change="readMoreFoos">
  <FooSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
</StyledWaypoint>
```

## Server Search-as-You-Type — hand-rolling BANNED

Hand-rolling search-as-you-type around a `$trpc` search query is **banned**: no per-component `useThrottle`/`refDebounced` + `watch` + `AbortController` + `isSearching` wiring, and no `@input` handler firing a query. That stack exists exactly once, in `useAutoSearch` — reach for it, or for `useCursorSearcher` when the results are cursor-paginated.

## Bundle Ancillary Reads with the Primary Read

When a component needs ancillary data (permissions, metadata) alongside a primary list load, bundle the ancillary read inside the primary read composable — not in the component's `onMounted`. An ancillary read belongs inside the composable owning the load (`useReadFoos`), called in `Promise.all` alongside other metadata reads. If there is no natural companion read, call it directly in `<script setup>` — still no `onMounted`.

```typescript
// bundle ancillary reads in the owning read composable — not a separate component onMounted fetch
const readBars = useReadBars();
const readBazes = useReadBazes();
const readFoos = () =>
  readItems(async () => {
    const data = await $trpc.foo.readFoos.query();
    const fooIds = data.items.map(({ id }) => id);
    if (fooIds.length > 0) await Promise.all([readBars(fooIds), readBazes(fooIds)]);
    return data;
  });
```

Follow the `useReadBars` shape for batch ancillary reads — a composable taking an **array** of ids, early-returning when it is empty, and issuing one batched query rather than N per-id calls.

## Offline IndexedDB Cache — self-contained

The offline cache mirrors Pinia state and owns both directions itself, so **nothing outside `usePaginationCache` touches it**. Never call `useOnline`, `readIndexedDb` or `writeIndexedDb` from a feature read composable, and never add cache options to `readItems`/`readMoreItems` — hydration is already automatic, and a read that reaches for the cache is a second source of truth for what is loaded.

## Deep Dives

- `references/search-as-you-type.md` — when wiring a search input that queries the server as the user types, or changing one that already does.
- `references/offline-cache.md` — when a list must survive going offline, or when adding or altering a feature cache composable.
