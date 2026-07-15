---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: the [consolidation](/docs/platform/resource-consolidation) shipped — this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Later — editors and capability parity

- [ ] Note resource ([spec](/docs/proposals/platform/note-resource)): rich-text document type on the existing Tiptap dependency — and a live test of the one-ResourceType extensibility claim

## Later — storage-backed (one Postgres migration or Azure table each, independently shippable)

- [ ] Favorites + true recents ([spec](/docs/proposals/platform/favorites-and-recents)): `resourceFavorites` table, star toggles, Home `Recent | Favorites` tabs, last-viewed recents
- [ ] Tags ([spec](/docs/proposals/platform/tags)): `tags` jsonb + GIN index, Essentials tags row + edit dialog, tag filter pill
- [ ] Activity log blade ([spec](/docs/proposals/platform/activity-log)) — Azure Table only, no Postgres migration
- [ ] Recycle bin ([spec](/docs/proposals/platform/recycle-bin)): `deletedAt` soft delete, restore/purge, timer auto-purge
- [ ] `pg_trgm` relevance ([spec](/docs/proposals/platform/global-search-relevance)): extension + GIN index migration, `similarity()` ranking for typo tolerance (Azure AI Search stays [deferred](/docs/platform/deferred/azure-ai-search))
- [ ] Summary view toggle on `/all`: per-type count cards over a grouped `count` procedure ([spec](/docs/proposals/platform/summary-view))

## Later — known defects

- [ ] Resource content date revival ([spec](/docs/proposals/platform/resource-content-date-revival)): `readResourceContent` revives ISO datetime strings into `Date`s that `columnValueSchema` then rejects — a Sheet cell holding an ISO datetime fails to read today; reproduce before fixing

## Later — larger or multi-area

- [ ] Blueprint resource ([spec](/docs/proposals/platform/blueprint-resource)): parameterized executable manifest of resources — deploy one blueprint, get a fully wired set with all the right settings and cross-references
- [ ] Blueprint capture ([spec](/docs/proposals/platform/blueprint-capture)): Save-as-blueprint on selected resources — contents captured, cross-resource ids rewritten to aliases automatically (best after the Blueprint resource ships)
- [ ] Publish history blade ([spec](/docs/proposals/platform/publish-history)): list `{id}/published/{n}` snapshots with view/restore-to-draft — verify snapshot retention first
- [ ] Dataset row-cap warning ([spec](/docs/proposals/platform/dataset-row-cap-warning)): surface "showing N of M" when a dataset hits the 1000-row `AZURE_MAX_PAGE_SIZE` cap — a real survey can silently truncate today
- [ ] Share to esbabbler ([spec](/docs/proposals/platform/share-to-esbabbler)): Share command posting the public link into a room you pick
- [ ] Create from file ([spec](/docs/proposals/platform/create-from-file)): drop a CSV/JSON/XLSX on the Sheet create form, land in a ready Data blade
- [ ] TodoList due reminders ([spec](/docs/proposals/platform/todolist-due-reminders)): scheduled Service Bus + web-push when an item comes due
