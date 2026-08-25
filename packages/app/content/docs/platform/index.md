---
title: Platform
description: The Azure-portal-like Resource Explorer over sheets, surveys, programs, todo lists, dashboards, emails, webpages, and flowcharts.
---

# Platform

The platform area is the cross-product integration program: **everything is a resource with opt-in capabilities**, surfaced through one Azure-portal-like Resource Explorer at `/resource-explorer`. A sheet, a survey, a program, a todo list, a dashboard, an email, a webpage, and a flowchart are all the same thing to the platform — an identity row, a content blob, and a definition — differing only in which blades and commands their type declares.

The standards the platform applies live in architecture: the layer model ([the platform layer model](/docs/architecture/platform)), the resource model ([resources](/docs/architecture/resources)), datasets ([datasets](/docs/architecture/datasets)), and publishing ([publishing](/docs/architecture/publishing)). The pages in this area describe the product surface built on them.

## Key concepts

- **Resource** — one Postgres identity row + one content blob in Azure Blob + one `ResourceDefinitionMap` entry. Single-owner, auth-gated, one `contentVersion` write path.
- **Capability** — a cross-cutting mechanism a type opts into: **Publishable** (versioned snapshot + public `/view/[type]/[id]`), **DatasetProvider** (serves columns + rows through `dataset.readDataset`), **Portable** (import/export formats), **FileAssets** (hosted binary assets under `{id}/files/…` — see [resource file assets](/docs/platform/resource-file-assets)).
- **Explorer** — the Azure-portal-shaped shell: Home landing, `/resource-explorer/all` list, marketplace-style create flow, and a resource page composing blades. See [resource explorer](/docs/platform/resource-explorer).
- **Blade** — one panel of a resource page, addressed by route segment (`/resource-explorer/[id]/[[blade]]`). Every resource has a built-in Overview; types add their own (Sheet: Data + Settings, Survey: Responses, Program: Setup + Status, TodoList: Items + Calendar) and editor-backed types render their editor inline in the Editor blade.
- **Dataset** — the read contract that lets one resource consume another's data: a Dashboard visual binds to a `DatasetReference` ([dashboard data binding](/docs/platform/dashboard-data-binding)), an Email binds one for merge fields ([email personalization](/docs/platform/email-personalization)), and a Program both binds one as its audience and serves one as its funnel status ([program resource](/docs/platform/program-resource)).

## Feature pages

- [Resource explorer](/docs/platform/resource-explorer) — the shell: Home, list, create flow, resource page, blades, command bar
- [Resource service menu](/docs/platform/resource-service-menu) — the standing left rail: All, Favorites, Recent, Tags and the bin as sibling routes over one list surface
- [List filters & views](/docs/platform/list-filters-and-views) — the list workbench: filter pills, URL-synced state, bulk operations, column chooser, grouping, CSV export
- [Summary view](/docs/platform/summary-view) — the `/all` List/Summary toggle: per-type count cards over a grouped count procedure
- [Resource page parity](/docs/platform/resource-page-parity) — labeled command bar with overflow, Refresh, Duplicate, type-the-name delete guard, save-conflict surface
- [Share to esbabbler](/docs/platform/share-to-esbabbler) — Share command posting a published resource's public link into a room you pick
- [Notifications bell](/docs/platform/notifications) — session-scoped operation-outcome toasts + app-bar bell panel
- [TodoList due reminders](/docs/platform/todolist-due-reminders) — web-push when a TodoList item comes due, over the scheduled-job + push subsystems
- [Global search](/docs/platform/global-search) — grouped as-you-type dropdown, `Ctrl+K` command palette, keyboard chords, relevance-ranked results
- [Global search relevance](/docs/platform/global-search-relevance) — `pg_trgm` trigram index and `similarity()` ranking, so a typo still finds its resource
- [Favorites & recents](/docs/platform/favorites-and-recents) — server-side stars and server-side opens, as Home tabs and as full list routes
- [Resource tags](/docs/platform/tags) — name:value pairs in Essentials, edited in place, filterable on `/all`
- [Recycle bin](/docs/platform/recycle-bin) — soft delete with restore, permanent purge, and a 30-day timer sweep
- [Activity log](/docs/platform/activity-log) — the per-resource audit trail blade, in Azure Table Storage
- [Publish history](/docs/platform/publish-history) — versioned snapshot blade with per-version view and restore-to-draft
- [Shell cohesion](/docs/platform/shell-cohesion) — the shared chrome primitives (page header, breadcrumbs, empty/loading states, launcher)
- [Breadcrumb trail](/docs/platform/breadcrumb-trail) — crumbs are the click path, the current page is the title, and a direct link shows no ancestor at all
- [Sheet resource](/docs/platform/sheet-resource) — CSV/JSON/XLSX files as resources with Data + Settings blades
- [Create from file](/docs/platform/create-from-file) — drop a CSV/JSON/XLSX on the Sheet create form and land in a ready Data blade
- [Survey resource](/docs/platform/survey-resource) — SurveyJS authoring, public respondent page, responses dataset
- [Program resource](/docs/platform/program-resource) — the distribution orchestrator: audience + email + survey bindings, opaque participant tokens, funnel status
- [Note resource](/docs/platform/note-resource) — a rich-text document type on Tiptap: JSON at rest, publishable `generateHTML` read view
- [Blueprint resource](/docs/platform/blueprint-resource) — a parameterized manifest of resources: deploy one blueprint, get a fully wired set with all the right cross-references
- [Blueprint capture](/docs/platform/blueprint-capture) — Save as blueprint on selected resources: contents captured, cross-resource ids rewritten to aliases automatically
- [Survey response controls](/docs/platform/survey-response-controls) — the accepting-responses toggle and the closed state that keeps participant links alive
- [Survey response modes](/docs/platform/survey-response-modes) — Anonymous or Identified identity, enforced at the write boundary
- [Survey response management](/docs/platform/survey-response-management) — response detail, owner delete, response count on Overview
- [Published view analytics](/docs/platform/published-view-analytics) — best-effort view counts on public reads for every publishable type
- [Dashboard data binding](/docs/platform/dashboard-data-binding) — visuals bound to datasets with client aggregation and publish-time snapshots
- [Dashboard chart interaction](/docs/platform/dashboard-chart-interaction) — the ApexCharts v6 investigation surface on visuals: linked highlighting, shareable view state, annotations
- [Email personalization](/docs/platform/email-personalization) — merge fields, survey invite blocks, personalized HTML export
- [Dataset row-cap warning](/docs/platform/dataset-row-cap-warning) — "showing N of M" wherever a dataset read hits the 1000-row cap
- [Email web view](/docs/platform/email-web-view) — Email is Publishable: save-time HTML capture, `/view/Email/[id]` browser copy
- [Flowchart publish](/docs/platform/flowchart-publish) — Flowchart is Publishable: read-only VueFlow render at `/view/Flowchart/[id]`
- [Resource file assets](/docs/platform/resource-file-assets) — the FileAssets capability: hosted binary assets + GrapesJS Asset Manager
- [Storage quotas](/docs/platform/storage-quotas) — per-user blob allowance held at SAS issuance and charged by Storage's own `BlobCreated` event, with a usage bar in the explorer shell's header
- [Webpage survey invite blocks](/docs/platform/webpage-survey-invite-blocks) — published surveys as drag-in invite buttons in both GrapesJS editors

Open work is in the [roadmap](/docs/platform/roadmap); the Azure-portal-parity designs it references live under [proposals](/docs/proposals). Ideas we chose not to pursue are under [deferred](/docs/platform/deferred) (with revisit triggers) and [rejected](/docs/platform/rejected).

## Shipped log

One line per program of work; the feature pages above carry the detail. The fact worth keeping at this level is
what the whole program cost: one Azure Table for the activity blade, one Service Bus queue for reminders, one
Event Grid subscription on a system topic that already existed, and a handful of Postgres migrations — no new
Azure service at any point.

- **Resource Explorer consolidation** — every product became a resource behind one explorer: the `resources` and `resource_publications` tables, one `ResourceAssets` container replacing six, the `createResourceProcedures` factory, and every per-editor page, picker and hub deleted.
- **Capabilities** — Publishable, DatasetProvider, Portable and FileAssets, each adopted by the types that declare them rather than rebuilt per type.
- **Explorer surface** — the list workbench, summary view, service menu, command-bar parity, global search and its trigram ranking, favorites, recents, tags, the recycle bin, activity log, and publish history.
- **Resource types** — Sheet (renamed from File), Survey, Program, Note and Blueprint, plus publish parity for Email and Flowchart.
- **Datasets** — the read contract one resource consumes another through: dashboard visual binding, email merge fields, and the Program funnel status, with the row cap surfaced wherever a read hits it.
- **Platform services** — storage quotas charged by Storage's own `BlobCreated` event, TodoList due reminders on the scheduled-job stack, and the notifications bell.
