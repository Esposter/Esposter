---
name: pagination
description: Apply when building or reviewing a paginated list, an infinite-scroll feed, a search-as-you-type input, or an offline list cache. Esposter paginated-list conventions — the three-layer cursor pagination pattern (store + useRead* composable + StyledWaypoint), a keyed write naming its key when issued, infinite scroll over a Load-more button, useAutoSearch/useCursorSearcher as the only search-as-you-type stack with MiniSearch as the one client-side index, ancillary reads bundled into the primary read, a total being the server's, a push re-read being the store's, and the offline IndexedDB cache being self-contained.
---

# Pagination, Search & Offline List Cache

## Cursor Pagination — Store + Composable + Waypoint

Every paginated list is three layers — a store on `useCursorPaginationData` (per-key lists on `useCursorPaginationDataMap`), a `useRead*` composable wrapping `readItems`/`readMoreItems`, and a component with `<StyledWaypoint>` — never a raw array or a component calling the read; an SSR'd list passes an `AsyncDataKey`, and a keyed write names its key where it is issued (`references/cursor-pagination.md`).

## StyledWaypoint — Infinite Scroll

`<StyledWaypoint>` loads the next page, never a Load-more button with a flag of its own; its observer is never torn down, and a default slot replaces its loader entirely (`references/cursor-pagination.md`).

## Search-as-you-type — hand-rolling BANNED

A server search goes through `useAutoSearch`, or `useCursorSearcher` for paginated results; data already loaded is searched with MiniSearch in a `computed`, never a hand-rolled index (`references/search-as-you-type.md`, `apps/web/content/docs/architecture/search.md`).

## Bundle Ancillary Reads with the Primary Read

When a component needs ancillary data (permissions, metadata) alongside a primary list load, bundle the ancillary read inside the primary read composable — not in the component's `onMounted`. An ancillary read belongs inside the composable owning the load (`useReadFoos`), called in `Promise.all` alongside other metadata reads. If there is no natural companion read, call it directly in `<script setup>` — still no `onMounted`.

```ts
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

- **A total over the list is the server's, returned with the page, never a `computed` over the loaded rows** — and every optimistic write that changes it moves it under the same rollback as the list. A keyed read's query closure never runs on the hydrating client, so it writes store state and nothing else. Both: `references/list-totals.md`.
- **A re-read after a push is the store's**, which snapshots the server half, pairs the timestamp watermark with the ids it already holds, and queues overlapping re-reads under one `executeMutation` key: `references/push-rereads.md`.

## Offline IndexedDB cache — self-contained

Nothing outside `usePaginationCache` touches the cache — no read composable calls `useOnline`, `readIndexedDb` or `writeIndexedDb`, and `readItems` takes no cache option (`references/offline-cache.md`).

## Deep Dives

- `references/search-as-you-type.md` — when wiring a search input that queries the server as the user types, or changing one that already does.
- `references/offline-cache.md` — when a list must survive going offline, or when adding or altering a feature cache composable.
- `references/list-totals.md` — when a surface shows a number about the whole list, or a keyed read's closure writes more than its page.
- `references/push-rereads.md` — when a store re-reads a list because a push arrived.
- `references/cursor-pagination.md` — when building a paginated list: the three layers, an SSR key, and a keyed write.
