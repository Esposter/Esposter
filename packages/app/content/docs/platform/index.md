---
title: Platform
description: The Azure-portal-like Resource Explorer over sheets, surveys, todo lists, dashboards, emails, webpages, and flowcharts.
---

# Platform

The platform area is the cross-product integration program: **everything is a resource with opt-in capabilities**, surfaced through one Azure-portal-like Resource Explorer at `/resources`. A sheet, a survey, a todo list, a dashboard, an email, a webpage, and a flowchart are all the same thing to the platform — an identity row, a content blob, and a definition — differing only in which blades and commands their type declares.

The standards the platform applies live in architecture: the layer model ([/docs/architecture/platform](/docs/architecture/platform)), the resource model ([/docs/architecture/resources](/docs/architecture/resources)), datasets ([/docs/architecture/datasets](/docs/architecture/datasets)), and publishing ([/docs/architecture/publishing](/docs/architecture/publishing)). The pages in this area describe the product surface built on them.

## Key concepts

- **Resource** — one Postgres identity row + one content blob in Azure Blob + one `ResourceDefinitionMap` entry. Single-owner, auth-gated, one `contentVersion` write path.
- **Capability** — a cross-cutting mechanism a type opts into: **Publishable** (versioned snapshot + public `/view/[type]/[id]`), **DatasetProvider** (serves columns + rows through `dataset.readDataset`), **Portable** (import/export formats).
- **Explorer** — the Azure-portal-shaped shell: Home landing, `/resources/all` list, marketplace-style create flow, and a resource page composing blades. See [resource explorer](/docs/platform/resource-explorer).
- **Blade** — one panel of a resource page, addressed by route segment (`/resources/[id]/[[blade]]`). Every resource has a built-in Overview; types add their own (Sheet: Data + Settings, Survey: Responses, TodoList: Items + Calendar) and editor-backed types render their editor inline in the Editor blade.
- **Dataset** — the read contract that lets one resource consume another's data: a Dashboard visual binds to a `DatasetReference` ([dashboard data binding](/docs/platform/dashboard-data-binding)), an Email binds one for merge fields ([email personalization](/docs/platform/email-personalization)).

## Feature pages

- [Resource explorer](/docs/platform/resource-explorer) — the shell: Home, list, create flow, resource page, blades, command bar
- [List filters & views](/docs/platform/list-filters-and-views) — the `/all` workbench: filter pills, URL-synced state, bulk operations, column chooser, grouping, CSV export
- [Resource page parity](/docs/platform/resource-page-parity) — labeled command bar with overflow, Refresh, Duplicate, type-the-name delete guard, save-conflict surface
- [Notifications bell](/docs/platform/notifications) — session-scoped operation-outcome toasts + app-bar bell panel
- [Global search](/docs/platform/global-search) — grouped as-you-type dropdown, `Ctrl+K` command palette, keyboard chords, relevance-ranked results
- [Global search relevance](/docs/platform/global-search-relevance) — `pg_trgm` trigram index and `similarity()` ranking, so a typo still finds its resource
- [Favorites & recents](/docs/platform/favorites-and-recents) — server-side stars and Home tabs over recently _viewed_ resources
- [Resource tags](/docs/platform/tags) — name:value pairs in Essentials, edited in place, filterable on `/all`
- [Recycle bin](/docs/platform/recycle-bin) — soft delete with restore, permanent purge, and a 30-day timer sweep
- [Activity log](/docs/platform/activity-log) — the per-resource audit trail blade, in Azure Table Storage
- [Shell cohesion](/docs/platform/shell-cohesion) — the shared chrome primitives (page header, breadcrumbs, empty/loading states, launcher)
- [Sheet resource](/docs/platform/sheet-resource) — CSV/JSON/XLSX files as resources with Data + Settings blades
- [Survey resource](/docs/platform/survey-resource) — SurveyJS authoring, public respondent page, responses dataset
- [Dashboard data binding](/docs/platform/dashboard-data-binding) — visuals bound to datasets with client aggregation and publish-time snapshots
- [Email personalization](/docs/platform/email-personalization) — merge fields, survey invite blocks, personalized HTML export
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
- Storage-backed explorer features — `resourceFavorites` + Home Recent/Favorites tabs, `tags` jsonb with Essentials editing and an `/all` pill, `deletedAt` soft delete with a Recycle bin and a 30-day timer purge, `pg_trgm` relevance ranking, and the Azure Table activity blade. Three Postgres migrations, one new Azure Table, no new Azure services.
