# Where navigation state lives — URL, history entry or storage

Read when deciding where a filter, a tab, a breadcrumb trail or a preference is kept, or when writing state into a history entry. The three-way split is in `SKILL.md`; this page is the history-entry mechanics, why the middle case is mis-filed, and the one place that state is written.

Decide by what the value **is**, not by what is reachable:

- **Part of what the page shows** (filter, page number, tab) → the **URL**, so a share, a bookmark and a refresh all show the same thing (`useEnumRouteQuery` below).
- **How the visitor got here** (a breadcrumb trail, whether this was a drill-down) → the **history entry**, read back from `window.history.state` and written by merging into it — spread the current state, or the write erases whatever the router keeps there:

  ```typescript
  window.history.replaceState({ ...window.history.state, trail }, "");
  ```

  Its lifetime already matches: per entry, kept across a reload, restored on back/forward, gone with the entry.

  **Everything in that object is structured-cloned, so none of it may be reactive state.** A `ref`'s array or a
  store's object reaches the serializer as a Proxy, which it rejects outright — and the `DataCloneError` is thrown
  inside the `afterEach` hook, so it rejects the navigation that was being recorded rather than merely losing the
  value. Hand the entry a plain snapshot, and make that the returned contract of the pure function above rather
  than a spread at the call site.

- **What the visitor prefers** (a collapsed rail, a theme) → **`localStorage`** through the `LocalStorageKey` registry — it outlives the tab and belongs to the person.

The middle case is the one that gets mis-filed. Putting "how I got here" in the URL mints a second address for one page (worse for sharing, bookmarks and analytics, and editable by anyone who types); putting it in storage makes it outlive the journey, so a tab restored later claims a path nobody walked.

**Write that state in one place — a `router.afterEach` hook in a client plugin — never at each link.** A value appended by hand at N call sites is one the N+1th link silently drops, and the page that lost it is indistinguishable from a page that never had it. Keep the rules as a pure function so they are testable without a browser, and validate anything read back off an entry (it may predate the release). Worked example: `apps/web/content/docs/resource/breadcrumb-trail.md`.
