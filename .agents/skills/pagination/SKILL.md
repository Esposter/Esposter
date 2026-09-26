---
name: pagination
description: Apply when building or reviewing a paginated list, an infinite-scroll feed, a search-as-you-type input, or an offline list cache. Esposter's paginated lists — a store, a useRead* composable and a StyledWaypoint for every list, useAutoSearch/useCursorSearcher as the only search-as-you-type stack, ancillary reads bundled into the primary read, a total the server's rather than a count of loaded rows, and an offline IndexedDB cache nothing outside it touches.
---

# Pagination, Search & Offline List Cache

## Cursor Pagination — Store + Composable + Waypoint

Every paginated list is three layers — a store on `useCursorPaginationData` (per-key lists on `useCursorPaginationDataMap`), a `useRead*` composable wrapping `readItems`/`readMoreItems`, and a component with `<StyledWaypoint>` — never a raw array or a component calling the read; an SSR'd list passes an `AsyncDataKey`, and a keyed write names its key where it is issued (`references/cursor-pagination.md`).

## StyledWaypoint — Infinite Scroll

`<StyledWaypoint>` loads the next page, never a Load-more button with a flag of its own; its observer is never torn down, and a default slot replaces its loader entirely (`references/cursor-pagination.md`).

## Search-as-you-type — hand-rolling BANNED

A server search goes through `useAutoSearch`, or `useCursorSearcher` for paginated results; data already loaded is searched with MiniSearch in a `computed`, never a hand-rolled index (`references/search-as-you-type.md`, `apps/web/content/docs/architecture/search.md`).

## Bundle Ancillary Reads with the Primary Read

**An ancillary read — permissions, metadata — belongs inside the primary read composable**, batched over the page's ids, never in the component's `onMounted` (`references/ancillary-reads.md`).

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
- `references/ancillary-reads.md` — when a list load needs companion data such as permissions or metadata.
