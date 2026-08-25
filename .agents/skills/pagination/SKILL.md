---
name: pagination
description: Esposter paginated-list conventions — the three-layer cursor pagination pattern (store + useRead* composable + StyledWaypoint), a keyed write naming its key when issued (the ambient items being readonly), infinite scroll instead of a Load-more button, the ban on hand-rolling search-as-you-type and MiniSearch being the one client-side index, bundling ancillary reads into the primary read, a total over the list being the server's rather than a count of the loaded rows (and moving under every optimistic write's rollback), a keyed read's query closure never running on the hydrating client so only Pinia state survives it, re-reading a list after a push (compare against the server half, and pair the timestamp watermark with the ids already held because equal timestamps tie), and the offline IndexedDB cache being self-contained, plus deep dives on wiring useAutoSearch/useCursorSearcher with its sanctioned exceptions and on the feature cache composables. Apply when building or reviewing a paginated list, an infinite-scroll feed, a search-as-you-type input, or an offline list cache.
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
- A list on an **SSR'd route** passes `readItems` a `key` from `AsyncDataKey`; one behind `ssr: false` (everything under `/messages`, `/calls`, `/dungeons`, `/resource-explorer`) passes none. Without a key the read runs twice per page load — the server issues it for the html, and hydration replays the same setup client-side — and the second answer can disagree with the rows already rendered. The key covers every input that changes which page the server rendered (the sort, the profile, the parent post), and only the hydrating render adopts the payload: a sort change, a pull to refresh and a client-side navigation all read live.
- Which pagination helper a store uses (single list vs per-key lists) is the `pinia` skill's (`references/keyed-state-and-pagination.md`).
- The endpoint-side input schemas are the `trpc` skill's (`references/read-endpoints.md`).

### A keyed write names its key when the operation is issued, not when it lands

`useCursorPaginationDataMap`'s ambient `items` is the **reading** view — it follows whichever key is current, which is what a rendered list wants and exactly what a write must not use, because a response landing after the reader moved on would file one key's rows under another's: one member's private moderation notes rendered against another member, one room's messages appended to another's.

So it is typed `readonly`, and the write does not compile. A writer comes from `getSlice(key)` alone, and obtaining one means naming the key — `readItems`/`readMoreItems` bind the current key up front and give this for free, so a `useRead*` composable needs nothing. Everything else resolves its slice where the operation is **issued**.

Two corollaries that are easy to get backwards:

- **Resolve per operation, never per composable.** A composable that outlives one target (`useMessageCache` is constructed once and lives across every room switch) would bind to the first key and stay there forever, which is worse than not binding at all — so a long-lived consumer takes `getSlice` itself and resolves inside the operation.
- **A partition that has already been named needs no re-check.** `usePaginationCache` used to bail when the partition moved on mid-hydrate; it now hydrates `getSlice(partitionKey)`, so the late write lands in the partition it was read for and re-opening that partition shows it. A guard added back on top would drop rows that are correctly filed.

Why the readonly type rather than a convention everyone remembers: the `invariants` skill.

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

**Searching data that is already loaded is the other branch, and it is not a free-for-all.** There is no request to throttle or abort, so `useAutoSearch` would be pure ceremony — but the index is **MiniSearch**, the same one docs search uses, queried by a `computed`. Never hand-roll a token map, a sorted-prefix array or a bespoke scorer: a second client-side search mechanism is exactly the drift the one stack exists to stop, and the hand-rolled one loses on relevance, which is the part that matters. Set `combineWith: "AND"` (the default unions terms) and `prefix: true`, boost the field the user is naming, and pin an exact hit ahead of the ranked results. Full standard, both branches: `packages/app/content/docs/architecture/search.md`.

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

### A total over a paginated list is the server's, never the loaded rows

Any number a surface shows _about the whole list_ — an unread badge, a "N items" summary, a filtered tally — is
computed by the endpoint and returned with the page, because the client holds one page and the answer is about
all of them. A `computed` counting `items` is right only for a list that is never paginated (a client-owned half
that exists solely in the tab), and it fails in the direction nobody notices: it reads low, and it reads correct
the whole time the list is short enough to fit one page. So it survives every manual check and breaks for the
users with the most rows.

Return it in the same query as the page rather than adding a second endpoint — one round trip, and a total that
cannot disagree with the rows beside it:

```typescript
// endpoint: the page and the total it belongs to, resolved together
const [items, [total]] = await Promise.all([findManyPage(), countMatchingRows()]);
return { paginationData: getCursorPaginationData(items, limit, sortBy), total: total?.count ?? 0 };
```

The store then holds the server's number and **every optimistic write that changes it moves it under the same
rollback as the list** — a delete decrements it, a clear-all zeroes it, and each rollback restores the previous
value alongside the previous rows. A write that gates on the loaded rows (`items.every(...)`) is the same bug one
layer down: gate on the total, which is the only value that speaks for the pages nobody has read.

### A keyed read's query closure does not run on the hydrating client

`readItems(query, { key })` adopts the payload on the hydrating render and **never calls `query`** there, so
anything the closure writes besides its returned page is written on the server only. That is fine — and the
reason the aggregate above may live in the closure — **as long as the destination is Pinia store state**, which
rides the payload and is restored on hydration. A closure that writes a module-level ref, a component ref or
anything else outside a store loses that value at hydration and leaves the surface rendering a default nobody
can explain. Anything read on the client goes in the store; the closure returns the page and writes store state,
nothing else.

## Re-reading a List After a Push

A delivered push says "something arrived", never what: the tab re-reads the first page and works out which rows
are new. Two rules make that reliable, and both come from the list being shared rather than owned by the push.

- **Compare against the half the push writes, never the merged list.** A surface that renders server rows
  alongside locally-created ones has two halves with different lifetimes; the newest row overall is routinely the
  local one, which has already been acted on. Snapshot the newest **server** row before the read, and act on the
  server rows past it.
- **A timestamp watermark needs the ids alongside it.** Postgres stores microseconds and a `Date` keeps
  milliseconds, so two rows written inside the same millisecond arrive with **equal** timestamps and a strict
  `>` drops the second one for good — it is not newer, and no later read will ever call it new again. Compare
  `>=` and exclude the ids the tab already held: the ids settle the ties, and the watermark still stops a page
  that simply grew (a tab holding fewer rows than a page) from replaying a backlog nobody was pushed.

Both belong in the **store**, not the plugin or component that receives the push: only the owner of the list can
tell its halves apart, and the receiver's job is to hand over the read.

## Offline IndexedDB Cache — self-contained

The offline cache mirrors Pinia state and owns both directions itself, so **nothing outside `usePaginationCache` touches it**. Never call `useOnline`, `readIndexedDb` or `writeIndexedDb` from a feature read composable, and never add cache options to `readItems`/`readMoreItems` — hydration is already automatic, and a read that reaches for the cache is a second source of truth for what is loaded.

## Deep Dives

- `references/search-as-you-type.md` — when wiring a search input that queries the server as the user types, or changing one that already does.
- `references/offline-cache.md` — when a list must survive going offline, or when adding or altering a feature cache composable.
