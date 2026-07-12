---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: the [consolidation](/docs/platform/resource-consolidation) shipped — this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Later — storage-backed (one Postgres migration or Azure table each, independently shippable)

- [ ] Favorites + true recents ([spec](/docs/proposals/platform/favorites-and-recents)): `resourceFavorites` table, star toggles, Home `Recent | Favorites` tabs, last-viewed recents
- [ ] Tags ([spec](/docs/proposals/platform/tags)): `tags` jsonb + GIN index, Essentials tags row + edit dialog, tag filter pill
- [ ] Activity log blade ([spec](/docs/proposals/platform/activity-log)) — Azure Table only, no Postgres migration
- [ ] Recycle bin ([spec](/docs/proposals/platform/recycle-bin)): `deletedAt` soft delete, restore/purge, timer auto-purge
- [ ] `pg_trgm` relevance ([spec](/docs/proposals/platform/global-search-relevance)): extension + GIN index migration, `similarity()` ranking for typo tolerance (Azure AI Search stays [deferred](/docs/platform/deferred/azure-ai-search))
- [ ] Summary view toggle on `/all`: per-type count cards over a grouped `count` procedure ([spec](/docs/proposals/platform/summary-view))

## Later — larger or multi-area

- [ ] Publish history blade ([spec](/docs/proposals/platform/publish-history)): list `{id}/published/{n}` snapshots with view/restore-to-draft — verify snapshot retention first
- [ ] Dataset row-cap warning ([spec](/docs/proposals/platform/dataset-row-cap-warning)): surface "showing N of M" when a dataset hits the 1000-row `AZURE_MAX_PAGE_SIZE` cap — a real survey can silently truncate today
- [ ] Share to esbabbler ([spec](/docs/proposals/platform/share-to-esbabbler)): Share command posting the public link into a room you pick
- [ ] Create from file ([spec](/docs/proposals/platform/create-from-file)): drop a CSV/JSON/XLSX on the File create form, land in a ready Data blade
- [ ] TodoList due reminders ([spec](/docs/proposals/platform/todolist-due-reminders)): scheduled Service Bus + web-push when an item comes due
