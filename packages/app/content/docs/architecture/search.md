---
title: Search
description: One search stack — StyledSearchDialog palettes, useAutoSearch/useCursorSearcher for server search-as-you-type, and the three sanctioned exceptions.
---

# Search

Every search UI in the repo composes from one small stack instead of hand-rolling its own throttle, request-cancellation, and hotkey wiring. Before this consolidation the app had three Ctrl+K palettes with three different hotkey mechanisms (`useVHotkey`, `onKeyStroke`, `useEventListener`) and a friends search that re-implemented throttle + abort + pending state inline; each copy drifted independently. The rule now: **hand-rolling search-as-you-type around a tRPC query is banned** — new search features pick a layer below, and anything that looks like a new exception gets refactored onto the stack instead.

## The layers

```mermaid
flowchart TD
  Palette["StyledSearchDialog (Ctrl+K palette shell)"] -- "v-model:search-query" --> Core
  Cursor["useCursorSearcher (cursor-paginated results)"] --> Core["useAutoSearch (throttle + abort + pending)"]
  Core -- "search(sanitizedQuery, signal)" --> Trpc["tRPC search procedure"]
```

### `useAutoSearch` — the shared core

`app/composables/useAutoSearch.ts` owns everything reactive about search-as-you-type, exactly once:

- **1s throttle** on the query ref (`useThrottle` + `dayjs.duration`) so typing doesn't fire a request per keystroke.
- **In-flight abort** — each new search aborts the previous request via `AbortController`; the `AbortSignal` is passed to the `search` callback to forward to tRPC as `{ signal }`.
- **Normalized change detection** — queries run through `normalizeString`, and a throttled value that normalizes to the same string as before does not re-query.
- **Reset on empty** — when the query empties out, the in-flight request aborts and the consumer's `reset` callback drops stale results (skipped with `isIncludeEmptySearchQuery`, for pickers where an empty query should list everything).
- **`isPending`** — the returned ref drives progress indicators; the consumer never tracks its own `isSearching` flag.
- **Error surfacing** — failures raise the real `Error.message` as an alert via the same `getResultAsync` → `createAlert` stack as [client data access](/docs/architecture/client-data); a superseded (aborted) request stays silent. `AbortController` plays the role the latest-wins guard plays for [reads on the shared primitive](/docs/architecture/async-operations) — with the bonus that the stale HTTP request is actually cancelled, not just ignored.

Consumers with plain array results call it directly:

```ts
const { isPending } = useAutoSearch(searchQuery, {
  reset: () => {
    searchResults.value = [];
  },
  search: async (sanitizedSearchQuery, signal) => {
    searchResults.value = await $trpc.friend.searchUsers.query(sanitizedSearchQuery, { signal });
  },
});
```

### `useCursorSearcher` — cursor-paginated results

`app/composables/useCursorSearcher.ts` composes `useAutoSearch` with `useCursorPaginationData` for searches whose results paginate (room pickers, forward-to dialogs). The query callback receives `(searchQuery, cursor, opts)` and must forward `opts` — it carries the abort signal. It returns `{ hasMore, items, readItemsSearched, readMoreItemsSearched, searchQuery }`, so the list renders with the standard `StyledWaypoint` infinite-scroll pattern.

```ts
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
```

### `StyledSearchDialog` — the palette shell

`StyledSearchDialog` is the one Ctrl+K palette: a `v-dialog` wrapping a solo, autofocused, clearable `mdi-magnify` text field. It exposes `v-model` (open state), `v-model:search-query`, an `activator` slot receiving `updateIsOpen`, and results in the default slot. Its `hotkey` prop registers through Vuetify's `useVHotkey` — the **only** sanctioned hotkey mechanism for dialog search; never re-roll `onKeyStroke` or `useEventListener` listeners per feature.

```vue
<StyledSearchDialog v-model="isOpen" v-model:search-query="query" hotkey="ctrl+k" placeholder="Search docs">
  <template #activator="{ updateIsOpen }">
    <StyledTooltipIconButton icon="mdi-magnify" text="Search (Ctrl+K)" @click="updateIsOpen(true)" />
  </template>
  <!-- results -->
</StyledSearchDialog>
```

What goes in the default slot is the feature's own concern — a client-index result list (docs), a cursor-paginated room list (room searcher), or anything else.

## Sanctioned exceptions

Three search shapes legitimately sit outside `useAutoSearch`, because there is no as-you-type server query to throttle/abort — or something else already owns fetch orchestration:

| Exception              | Why it is out of scope                                                                                                | Example                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `v-data-table-server`  | The table owns fetch orchestration — its `search` prop triggers `@update:options`; feed it a `refDebounced` query ref | `Resource/List/View.vue` + `useReadResources`            |
| Explicit-submit search | Enter-triggered with filters and search history; nothing fires per keystroke                                          | Message right-sidebar search (`useReadSearchedMessages`) |
| Client-index search    | A `computed` over already-loaded data — no server call, no abort, no pending state                                    | Docs search (MiniSearch)                                 |

Portal chord shortcuts (`useResourceKeyboardShortcuts` G-chords) are likewise a separate concern from the palette `hotkey` prop — chords are sequences, not single hotkeys.

## Key files

| File                                                        | Role                                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `app/composables/useAutoSearch.ts`                          | Shared core — throttle, abort, normalized change detection, `isPending`                 |
| `app/composables/useCursorSearcher.ts`                      | Cursor-paginated search on top of `useAutoSearch`                                       |
| `app/components/Styled/SearchDialog.vue`                    | `StyledSearchDialog` — Ctrl+K palette shell (`hotkey` via `useVHotkey`)                 |
| `app/components/Docs/Search.vue`                            | Palette + client-index results (MiniSearch)                                             |
| `app/components/Message/Model/Room/Searcher.vue`            | Palette + cursor-paginated results (`useSearchStore`)                                   |
| `app/components/Message/Friends/Search.vue`                 | Inline (non-palette) `useAutoSearch` consumer                                           |
| `app/composables/resource/search/useResourceSearchItems.ts` | Portal dropdown — `useAutoSearch` for the Resources group, client-side groups around it |
| `app/store/message/room/search.ts`                          | Store returning `useCursorSearcher` for the room palette                                |

## Notes

- The 1-second throttle and the `normalizeString` sanitization are deliberately inside the core, not per consumer — a feature wanting a different cadence is a smell, not a parameter.
- Zero-result and pending UI stay with the consumer; the stack only guarantees the query lifecycle.
- Dialog-style delete confirmation has the same "one shell, never re-roll" treatment — see [Singleton dialogs](/docs/architecture/singleton-dialogs).
