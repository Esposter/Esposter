---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: the [consolidation](/docs/platform/resource-consolidation) shipped — this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Next — end-to-end survey funnel (invite → respond → analyze)

The audience → email invite → survey → responses → dashboard loop works today but leaks in the middle: responses can't be joined back to invites, a survey can't close without 404ing its links, junk responses can't be removed, and the view step is invisible. These close it (response modes + program ship together; the rest are independent):

- [ ] Survey response modes ([spec](/docs/proposals/platform/survey-response-modes)): explicit Anonymous | Invited mode in survey settings, opaque `inviteToken` on responses, per-mode server validation — the extensible identity foundation
- [ ] Program resource ([spec](/docs/proposals/platform/program-resource)): the distribution orchestrator — binds audience + email + survey, issues opaque invite tokens, Status blade + `ProgramStatus` dataset provider for funnel dashboards
- [ ] Survey response controls ([spec](/docs/proposals/platform/survey-response-controls)): Accepting-responses toggle enforced server-side, closed state on the respondent page instead of unpublish-404
- [ ] Survey response management ([spec](/docs/proposals/platform/survey-response-management)): per-response detail dialog, owner delete, response count on Overview
- [ ] Published view analytics ([spec](/docs/proposals/platform/published-view-analytics)): best-effort view counter (Azure Table) on public reads, Views row on Overview — views vs responses is the completion rate
- [ ] Webpage survey invite blocks ([spec](/docs/proposals/platform/webpage-survey-invite-blocks)): the email editor's invite blocks in the webpage editor via a shared block builder
- [ ] Funnel integration tests ([spec](/docs/proposals/platform/funnel-integration-tests)): the TDD contract — per-proposal acceptance checklists land red→green with each item above; the café-scenario integration spec closes the section

## Later — editors and capability parity

- [ ] Resource file assets ([spec](/docs/proposals/platform/resource-file-assets)): promote Survey's `{id}/files` SAS machinery to a FileAssets capability + GrapesJS Asset Manager wiring — hosted images for Email/Webpage instead of base64, prerequisite for email sending
- [ ] Email web view ([spec](/docs/proposals/platform/email-web-view)): Email opts into Publishable — save-time HTML capture, `/view/email/[id]` "view in browser" page (best after file assets)
- [ ] Flowchart publish ([spec](/docs/proposals/platform/flowchart-publish)): Flowchart opts into Publishable — read-only VueFlow view, the simplest capability adoption
- [ ] Note resource ([spec](/docs/proposals/platform/note-resource)): rich-text document type on the existing Tiptap dependency — and a live test of the one-ResourceType extensibility claim

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
- [ ] Create from file ([spec](/docs/proposals/platform/create-from-file)): drop a CSV/JSON/XLSX on the Sheet create form, land in a ready Data blade
- [ ] TodoList due reminders ([spec](/docs/proposals/platform/todolist-due-reminders)): scheduled Service Bus + web-push when an item comes due
