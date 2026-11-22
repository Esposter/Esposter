# Cursor Pagination

Read when building a paginated list: the store, the `useRead*` composable, the component, and the rules each layer keeps.

Every paginated list follows a three-layer pattern. **Never load pages directly in a component or store a raw array for paginated data.**

## Layer 1 — Store

Call `useCursorPaginationData<TItem>()` (handles the ref + cast internally). Expose `hasMore`, `items`, `readItems`, `readMoreItems`:

```ts
export const useFooStore = defineStore("feature/foo", () => {
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<FooEntity>();
  // a list's writes go through the overlay, not items.value (see the rules below)
  return { hasMore, items, readItems, readMoreItems };
});
```

`hasMore` is computed from the page's `nextCursor`; the server answers no `hasMore` of its own.

## Layer 2 — `useRead*` Composable

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

## Layer 3 — Component / Page

`await readFoos()` at setup time, destructure `hasMore` + `items` via `storeToRefs`, and place `<StyledWaypoint>` at the bottom of the list (inside the container, after all items). It only triggers when `:is-active` is true, so always rendering it is safe.

```vue
<script setup lang="ts">
const { readFoos, readMoreFoos } = useReadFoos(roomId);
const fooStore = useFooStore();
const { hasMore, items } = storeToRefs(fooStore);
await readFoos();
</script>

<template>
  <div v-if="items.length > 0" flex flex-col>
    <FooItem v-for="item of items" :key="item.id" :item />
    <StyledWaypoint :is-active="hasMore" @change="readMoreFoos" />
  </div>
</template>
```

## Rules

- **Never** store a paginated list as a plain `ref<TItem[]>` — always the `Page<TItem>` (`{ items, nextCursor }`) that `useCursorPaginationData` holds.
- **Never** call `readItems`/`readMoreItems` from a component directly — always via a `useRead*` composable.
- A write to a list is an overlay write, not a change to `items.value`: it carries an entry the list's view applies over the held rows, the server's answer arrives the rows it changed, and a delete is a tombstone the view hides. A list holds its page by key and reads each row from the overlay, so a row another read or an event brings reaches it too. The rule, and the lists that keep their own page (the recycle bin, a whole-value read), are `openspec/changes/archive/2026-11-22-architecture-optimistic-overlay/design.md` under "Lists and single rows".
- `readMoreItems` appends; `readItems` resets the full `Page` ref (handles navigating back to first page).
- A reset replaces the partition's data and retires the old one: a read issued against the retired data is dropped when it lands, so a page of the order a reset left behind never fills the list the new order reads into. A cache hydration replaces data without retiring it, so a read in flight still lands on the rows it restores (`emptyCursorPaginationData` in `useCursorPaginationOperationData.ts`).
- A list on an **SSR'd route** passes `readItems` a `key` from `AsyncDataKey`; one behind `ssr: false` (the routes `apps/web/configuration/routeRules.ts` marks) passes none. Without a key the read runs twice per page load — the server issues it for the html, and hydration replays the same setup client-side — and the second answer can disagree with the rows already rendered. The key covers every input that changes which page the server rendered (the sort, the profile, the parent post), and only the hydrating render adopts the payload: a sort change, a pull to refresh and a client-side navigation all read live.
- Which pagination helper a store uses (single list vs per-key lists) is the `pinia` skill's (`references/keyed-state-and-pagination.md`).
- The endpoint-side input schemas are the `trpc` skill's (`references/read-endpoints.md`).

## A keyed write names its key when the operation is issued, not when it lands

Why a keyed write names its key is the `pinia` skill's (`references/keyed-state-and-pagination.md`). A `useRead*` composable gets this for free, since `readItems`/`readMoreItems` bind the current key up front. Two corollaries that are easy to get backwards:

- **A long-lived consumer resolves inside the operation.** `useMessageCache` is constructed once and lives across every room switch, so it takes `getSlice` itself rather than binding the first key.
- **A partition that has already been named needs no re-check.** `usePaginationCache` hydrates `getSlice(partitionKey)` unconditionally, so a write that lands after the partition has moved on is still filed under the partition it was read for, and re-opening that partition shows it. A staleness guard on top of that — bailing because the current partition is no longer the one being hydrated — drops rows that are correctly filed.

## StyledWaypoint — infinite scroll

Use `<StyledWaypoint>` for cursor-paginated lists instead of a "Load more" button. Never use a manual "Load more" `UiButton` with a loading flag of its own — that belongs to `StyledWaypoint`.

- `:is-active="hasMore"` — `v-show` and deactivated when there are no more pages
- `@change="readMoreXxx"` — handler must accept `(onComplete: () => void)` and call `onComplete()` when done (via the `onComplete` arg to `readMoreItems`)
- **Its observer is deliberately never torn down.** `v-show` already hides an exhausted waypoint, and an `IntersectionObserver` on a `display: none` element reports not-intersecting and simply stops firing — so gating `useElementVisibility` on `isActive` (a `watchEffect` that re-observes, a `v-if` in place of the `v-show`) buys no work back and adds a re-observation race on the way in. Leave the observer alive for the component's life; this is the general rule in the `vue-composable-patterns` skill (`references/resource-cleanup.md`).
- **Default slot replaces the built-in loader entirely.** The fallback is a `UiSpinner` rendered only while loading; supplying slot content overrides it and the slot gets **no `isLoading` prop**, so passed skeletons render whenever `isActive` — not just during a fetch. Omit the slot unless you want that always-visible placeholder.

```vue
<StyledWaypoint :is-active="hasMore" @change="readMoreFoos">
  <FooSkeletonItem v-for="i in DEFAULT_PAGE_LIMIT" :key="i" />
</StyledWaypoint>
```
