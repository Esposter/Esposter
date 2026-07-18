---
title: Platform
description: The Azure-portal-like Resource Explorer over sheets, surveys, programs, todo lists, dashboards, emails, webpages, and flowcharts.
---

# Platform

The platform area is the cross-product integration program: **everything is a resource with opt-in capabilities**, surfaced through one Azure-portal-like Resource Explorer at `/resources`. A sheet, a survey, a program, a todo list, a dashboard, an email, a webpage, and a flowchart are all the same thing to the platform — an identity row, a content blob, and a definition — differing only in which blades and commands their type declares.

The standards the platform applies live in architecture: the layer model ([/docs/architecture/platform](/docs/architecture/platform)), the resource model ([/docs/architecture/resources](/docs/architecture/resources)), datasets ([/docs/architecture/datasets](/docs/architecture/datasets)), and publishing ([/docs/architecture/publishing](/docs/architecture/publishing)). The pages in this area describe the product surface built on them.

## Key concepts

- **Resource** — one Postgres identity row + one content blob in Azure Blob + one `ResourceDefinitionMap` entry. Single-owner, auth-gated, one `contentVersion` write path.
- **Capability** — a cross-cutting mechanism a type opts into: **Publishable** (versioned snapshot + public `/view/[type]/[id]`), **DatasetProvider** (serves columns + rows through `dataset.readDataset`), **Portable** (import/export formats), **FileAssets** (hosted binary assets under `{id}/files/…` — see [resource file assets](/docs/platform/resource-file-assets)).
- **Explorer** — the Azure-portal-shaped shell: Home landing, `/resources/all` list, marketplace-style create flow, and a resource page composing blades. See [resource explorer](/docs/platform/resource-explorer).
- **Blade** — one panel of a resource page, addressed by route segment (`/resources/[id]/[[blade]]`). Every resource has a built-in Overview; types add their own (Sheet: Data + Settings, Survey: Responses, Program: Setup + Status, TodoList: Items + Calendar) and editor-backed types render their editor inline in the Editor blade.
- **Dataset** — the read contract that lets one resource consume another's data: a Dashboard visual binds to a `DatasetReference` ([dashboard data binding](/docs/platform/dashboard-data-binding)), an Email binds one for merge fields ([email personalization](/docs/platform/email-personalization)), and a Program both binds one as its audience and serves one as its funnel status ([program resource](/docs/platform/program-resource)).

## Feature pages

- [Resource explorer](/docs/platform/resource-explorer) — the shell: Home, list, create flow, resource page, blades, command bar
- [List filters & views](/docs/platform/list-filters-and-views) — the `/all` workbench: filter pills, URL-synced state, bulk operations, column chooser, grouping, CSV export
- [Summary view](/docs/platform/summary-view) — the `/all` List/Summary toggle: per-type count cards over a grouped count procedure
- [Resource page parity](/docs/platform/resource-page-parity) — labeled command bar with overflow, Refresh, Duplicate, type-the-name delete guard, save-conflict surface
- [Share to esbabbler](/docs/platform/share-to-esbabbler) — Share command posting a published resource's public link into a room you pick
- [Notifications bell](/docs/platform/notifications) — session-scoped operation-outcome toasts + app-bar bell panel
- [Global search](/docs/platform/global-search) — grouped as-you-type dropdown, `Ctrl+K` command palette, keyboard chords, relevance-ranked results
- [Global search relevance](/docs/platform/global-search-relevance) — `pg_trgm` trigram index and `similarity()` ranking, so a typo still finds its resource
- [Favorites & recents](/docs/platform/favorites-and-recents) — server-side stars and Home tabs over recently _viewed_ resources
- [Resource tags](/docs/platform/tags) — name:value pairs in Essentials, edited in place, filterable on `/all`
- [Recycle bin](/docs/platform/recycle-bin) — soft delete with restore, permanent purge, and a 30-day timer sweep
- [Activity log](/docs/platform/activity-log) — the per-resource audit trail blade, in Azure Table Storage
- [Publish history](/docs/platform/publish-history) — versioned snapshot blade with per-version view and restore-to-draft
- [Shell cohesion](/docs/platform/shell-cohesion) — the shared chrome primitives (page header, breadcrumbs, empty/loading states, launcher)
- [Sheet resource](/docs/platform/sheet-resource) — CSV/JSON/XLSX files as resources with Data + Settings blades
- [Create from file](/docs/platform/create-from-file) — drop a CSV/JSON/XLSX on the Sheet create form and land in a ready Data blade
- [Survey resource](/docs/platform/survey-resource) — SurveyJS authoring, public respondent page, responses dataset
- [Program resource](/docs/platform/program-resource) — the distribution orchestrator: audience + email + survey bindings, opaque participant tokens, funnel status
- [Survey response controls](/docs/platform/survey-response-controls) — the accepting-responses toggle and the closed state that keeps participant links alive
- [Survey response modes](/docs/platform/survey-response-modes) — Anonymous or Identified identity, enforced at the write boundary
- [Survey response management](/docs/platform/survey-response-management) — response detail, owner delete, response count on Overview
- [Published view analytics](/docs/platform/published-view-analytics) — best-effort view counts on public reads for every publishable type
- [Dashboard data binding](/docs/platform/dashboard-data-binding) — visuals bound to datasets with client aggregation and publish-time snapshots
- [Email personalization](/docs/platform/email-personalization) — merge fields, survey invite blocks, personalized HTML export
- [Dataset row-cap warning](/docs/platform/dataset-row-cap-warning) — "showing N of M" wherever a dataset read hits the 1000-row cap
- [Email web view](/docs/platform/email-web-view) — Email is Publishable: save-time HTML capture, `/view/email/[id]` browser copy
- [Flowchart publish](/docs/platform/flowchart-publish) — Flowchart is Publishable: read-only VueFlow render at `/view/flowchart/[id]`
- [Resource file assets](/docs/platform/resource-file-assets) — the FileAssets capability: hosted binary assets + GrapesJS Asset Manager
- [Webpage survey invite blocks](/docs/platform/webpage-survey-invite-blocks) — published surveys as drag-in invite buttons in both GrapesJS editors
- [Resource Explorer consolidation](/docs/platform/resource-consolidation) — the shipped six-phase program record

Open work is in the [roadmap](/docs/platform/roadmap); the Azure-portal-parity designs it references live under [proposals](/docs/proposals). Ideas we chose not to pursue are under [deferred](/docs/platform/deferred) (with revisit triggers) and [rejected](/docs/platform/rejected).

## Shipped

- Dataset contract — `dataset.readDataset` + Sheet/SurveyResponses providers
- Dashboard visual dataset binding — reference + query per visual, client aggregation, bind-to-data form, per-visual refresh
- Document publish lifecycle — versioned snapshots + public `/view/[type]/[id]` (now the Publishable capability)
- Email personalization — merge-field blocks, survey invite blocks, per-row personalized HTML export
- Dashboard binding polish — multi-series editing, Sheet sources; published-view OG meta tags
- Survey distribution fixes — publishing snapshots the model; the public respondent page serves that snapshot and 404s for unpublished surveys
- **Resource Explorer consolidation (Phases 1–6)** — everything became a resource behind one explorer: `resources` + `resource_publications` tables, one `ResourceAssets` container replacing six, `createResourceProcedures` factory, the explorer shell, all editors migrated to inline blades, the `surveys` table folded in, and every per-editor page/picker/hub deleted. Zero new dependencies and zero new Azure services across all six phases.
- Global search overhaul — `ResourceSearchMenu` grouped dropdown (inline Home mount + `Ctrl+K` palette), localStorage recents, `G`-chords + `?` shortcuts overlay, prefix-match ranking in `readResources`
- `/all` list workbench — filter pills (type/status/updated), URL-synced state, bulk select + batch delete, column chooser, group-by-type, chunked CSV export, real-link name cells, skeleton/empty/error states
- Resource page command-bar parity — labeled commands with `…` overflow, Refresh, `duplicateResource`, type-the-name/`delete {n}` destructive guards
- Notifications bell — session-scoped notification store, app-bar bell + single snackbar queue, `G N` chord, stale-`contentVersion` save-conflict surface
- File resource renamed to **Sheet** — pg enum value, `sheet` router, models/components/store, and the docs area (`sheet-editor`, `sheet-resource`); no backwards compat
- **End-to-end survey funnel** — the send → view → respond → analyze loop closed: survey `settings` (accepting-responses toggle + Anonymous/Identified response mode) enforced at one server write boundary, the **Program** resource issuing opaque participant tokens and serving the identity-free `ProgramStatus` dataset, owner-side response detail/delete/count, and best-effort view counts on every publishable type's public read. One new Postgres enum value and two new Azure Tables; no new services. The café-scenario chain is covered end to end by `surveyFunnel.integration.test.ts`.
- Explorer parity smalls — `/all` Summary lens over a grouped `countsByType`, the dataset row cap surfaced as "showing N of M" in every consumer (`Dataset.totalRows` + `countEntities`), Sheet create-from-file landing in a ready Data blade, and a Share command posting a published link into an esbabbler room
- FileAssets capability — Survey's `{id}/files` SAS machinery promoted onto the resource factory, adopted by Email and Webpage through a GrapesJS Asset Manager adapter (hosted images instead of base64)
- Publish parity for the remaining visual types — Email (`/view/email/[id]` browser copy via save-time MJML capture) and Flowchart (read-only VueFlow render) both opted into Publishable; Sheet and TodoList stay non-publishable by design
- Survey invite blocks in the webpage editor — the email block builder moved to a shared core with per-editor markup wrappers
- Storage-backed explorer features — `resourceFavorites` + Home Recent/Favorites tabs, `tags` jsonb with Essentials editing and an `/all` pill, `deletedAt` soft delete with a Recycle bin and a 30-day timer purge, `pg_trgm` relevance ranking, and the Azure Table activity blade. Three Postgres migrations, one new Azure Table, no new Azure services.
- Publish history blade — a capability-gated built-in blade listing every retained `{id}/published/{n}` snapshot from a blob prefix listing (no history table), an owner-only `?version=` preview on the view route, and a restore-to-draft copying a snapshot into the working copy. No new tables or Azure services.
