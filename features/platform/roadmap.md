# Platform Roadmap

Azure-portal parity program for the Resource Explorer: the consolidation shipped ([reference/resource-consolidation.md](reference/resource-consolidation.md)) — this backlog closes the UX gap between our explorer and the real portal. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Next — global search overhaul ([specs/global-search.md](specs/global-search.md))

- [ ] `ResourceSearchMenu` dropdown panel — grouped as-you-type results (Resources / Services / Pages), keyboard nav, match highlight, "See all results →" footer
  - [ ] Debounced `resource.readResources { searchQuery, limit: 5 }` → Resources group
  - [ ] Client-side match over `ResourceDefinitionMap` titles/descriptions → Services group (open filtered `/all`, sub-action Create)
  - [ ] Static Pages group (Home, All resources, Create a resource)
  - [ ] ARIA combobox + `↑`/`↓`/`Enter`/`Esc`
- [ ] Empty-query dropdown state: recent searches + recently viewed (both `LocalStorageKey`)
- [ ] Command-palette mount: `Ctrl+K` (and app-bar button) opens the same `ResourceSearchMenu` in a dialog on every page; Home embeds it inline — this also delivers the post-consolidation command-palette idea
- [ ] Keyboard shortcuts: `G /` focuses search (the Home placeholder already advertises it), `G H` Home, `G A` All resources, `G N` notifications panel; `?` opens a shortcuts overlay
- [ ] Prefix-match ranking in `readResources` (`name ILIKE 'q%'` first, then substring, then `updatedAt` desc)

## Next — `/all` list quick wins ([specs/list-filters-and-views.md](specs/list-filters-and-views.md))

- [ ] Wire the type facet — `useReadResources` already takes `types` and the server already filters; `ResourceListView` passes a hard-coded empty ref. Multi-select type dropdown in the toolbar
- [ ] URL state: `search`/`types`/`status`/`sortBy`/`page` sync to query params (deep-linkable, refresh-safe, back-button)
- [ ] Name cell renders a real `:to` link (middle-click/ctrl-click currently broken — row click is `navigateTo` only)
- [ ] Loading skeletons (`StyledSkeleton`) on Home recents, `/all` table, Overview essentials
- [ ] Filtered-empty state distinct from no-resources ("No resources match your filters" + Clear filters) + error/retry state on load failure

## Next — list + page parity (frontend + procedures, no schema)

- [ ] Filter-pill row ([specs/list-filters-and-views.md](specs/list-filters-and-views.md)): `Type ==` pill + `+ Add filter` menu (Status via `resource_publications` exists-filter, Updated date range)
- [ ] Bulk select + delete: checkbox column, `Delete (n)` toolbar command, batch `deleteResources` procedure
- [ ] Column chooser (Manage view) persisted to `LocalStorageKey`; group-by-type toggle; Export CSV; Refresh button; footer "Showing x–y of N" + page-size select; row context menu (Open / Open in new tab / Copy link / Rename / Delete)
- [ ] Command bar parity ([specs/resource-page-parity.md](specs/resource-page-parity.md)): icon+label text buttons with dividers, `…` overflow when narrow, Refresh command
- [ ] Delete confirmation requires typing the resource name (`StyledDeleteFormDialog` `confirmName`); reused by bulk delete
- [ ] Duplicate command: `duplicateResource` procedure (copy row as `{name} (copy)` + copy content blob, never the publication)
- [ ] Notifications bell ([specs/notifications.md](specs/notifications.md)): client-only store + app-bar bell + toasts for create/publish/delete/import/export outcomes
- [ ] Save-conflict surface: stale `contentVersion` rejection → notification "Modified elsewhere — refresh to load the latest"

## Later — storage-backed (one Postgres migration or Azure table each, independently shippable)

- [ ] Favorites + true recents ([specs/favorites-and-recents.md](specs/favorites-and-recents.md)): `resourceFavorites` table, star toggle in list + command bar, Home `Recent | Favorites` tabs; recents switch from `updatedAt` to last-_viewed_ (localStorage first, `resourceViews` table when cross-device matters)
- [ ] Tags ([specs/tags.md](specs/tags.md)): `tags` jsonb (`Record<string, string>`, Azure name:value parity) + GIN index, Essentials tags row + edit dialog, tag filter pill
- [ ] Activity log blade ([specs/activity-log.md](specs/activity-log.md)) — Azure Table only, no Postgres migration: audit trail (created/renamed/saved/published/imported) as a built-in blade on every type
- [ ] Recycle bin ([specs/recycle-bin.md](specs/recycle-bin.md)): `deletedAt` soft delete, restore/purge, timer-driven auto-purge
- [ ] `pg_trgm` relevance ([specs/global-search.md](specs/global-search.md)): extension + GIN index migration, `similarity()` ranking for typo tolerance (Azure AI Search stays [deferred](deferred/azure-ai-search.md))
- [ ] Summary view toggle on `/all`: per-type count cards over a grouped `count` procedure

## Later — larger or multi-area

- [ ] Publish history blade: list `{id}/published/{n}` snapshots with view/rollback — investigate first whether prior-version blob dirs are retained on re-publish
- [ ] Dataset row-cap warning: surface "showing N of M" when a dataset hits the 1000-row `AZURE_MAX_PAGE_SIZE` cap ([deferred/dataset-row-cap-pagination.md](deferred/dataset-row-cap-pagination.md)) — a real survey can silently truncate today
- [ ] Share to esbabbler: send a published resource link into a room (pairs with [deferred/esbabbler-link-unfurl.md](deferred/esbabbler-link-unfurl.md))
