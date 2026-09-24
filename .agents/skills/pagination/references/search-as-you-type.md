# Server search-as-you-type

Read when wiring a search input that queries the server as the user types, or when something already does and you are changing it.

Hand-rolling search-as-you-type around a `$trpc` search query is **banned** — no per-component `useThrottle`/`refDebounced` + `watch` + `AbortController` + `isSearching` wiring, and no `@input` handlers firing queries. That stack exists exactly once, in `useAutoSearch` (`app/composables/useAutoSearch.ts`): the throttle window it owns, in-flight request abort, normalized-query change detection, reset-on-empty, an `isPending` ref, and the shared `getResultAsync` → `createAlert` error surfacing from the client-data conventions (superseded/aborted requests stay silent — no consumer writes error handling).

Pick the layer by result shape:

- **Cursor-paginated results** → `useCursorSearcher(query, isAutoSearch?, isIncludeEmptySearchQuery?)` — wraps `useAutoSearch` + `useCursorPaginationData`; the query callback receives `(searchQuery, cursor, opts)` and must forward `opts` (carries the abort signal) to the tRPC call. Both flags are literal `true`-only (never `false`): the 2nd opts into auto-search, and the 3rd makes an empty query list everything (e.g. room pickers) — it only has an effect alongside the 2nd. Returns `{ hasMore, items, readSearchedItems, readMoreSearchedItems, searchQuery }`.
- **Plain array results** → `useAutoSearch(searchQuery, { reset, search })` directly; `search` receives the sanitized query and the `AbortSignal` to forward as `{ signal }`.
- **Ctrl+K palette UI** → register the search as the command palette's scope with `useCommandScope` (see the `ui-library` skill).

```ts
// stores/dialogs with cursor pagination
export const useSearchStore = defineStore("<feature>/foo/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher((searchQuery, cursor, opts) => {
    const normalizedSearchQuery = normalizeString(searchQuery);
    return $trpc.foo.readFoos.query(
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
    searchResults.value = await $trpc.foo.searchFoos.query(sanitizedSearchQuery, { signal });
  },
});
```

The only sanctioned exceptions (documented in `apps/web/content/docs/architecture/search.md`):

- **Server-read tables** — `UiDataTable`'s page, size and order are the call site's models, and the call site reads whenever they or its filter key change; feed the filter a `refDebounced(searchQuery, …)`.
- **Explicit-submit search** — Enter-triggered with filters and search history; no as-you-type querying to throttle.
- **Client-index search** — MiniSearch/computed over already-loaded data; no server call, so a plain `computed` (optionally `refDebounced`) suffices.

Anything else that looks like a new exception should be refactored onto `useAutoSearch` instead.
