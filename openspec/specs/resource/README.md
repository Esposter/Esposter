# Resource

The resource area is the cross-product integration program: **everything is a resource with opt-in capabilities**, surfaced through one Azure-portal-like Resource Explorer at `/resource-explorer`. A sheet, a survey, a program, a todo list, a dashboard, an email, a webpage, and a flowchart are all the same thing to the resource layer — an identity row, a content blob, and a definition — differing only in which blades and commands their type declares.

The standards the area applies live in architecture: the layer model ([cross-product layer model](../architecture/layer-model/design.md)), the resource model ([resource](../architecture/resource/design.md)), datasets ([dataset](../architecture/dataset/design.md)), and publishing ([publishing](../architecture/publishing/design.md)). The pages in this area describe the product surface built on them.

## Key concepts

- **Resource** — one Postgres identity row + one content blob in Azure Blob + one `ResourceDefinitionMap` entry. Single-owner, auth-gated, one `contentVersion` write path.
- **Capability** — a cross-cutting mechanism a type opts into: **Publishable** (versioned snapshot + public `/view/[type]/[id]`), **DatasetProvider** (serves columns + rows through `dataset.readDataset`), **Portable** (import/export formats), **FileAssets** (hosted binary assets under `{id}/files/…` — see [resource file assets](resource-file-assets/design.md)).
- **Explorer** — the Azure-portal-shaped shell: Home landing, `/resource-explorer/all` list, marketplace-style create flow, and a resource page composing blades. See [resource explorer](explorer/design.md).
- **Blade** — one panel of a resource page, addressed by route segment (`/resource-explorer/[id]/[[blade]]`). Every resource has a built-in Overview; types add their own (Sheet: Data + Settings, Survey: Responses, Program: Setup + Status, TodoList: Items + Calendar) and editor-backed types render their editor inline in the Editor blade.
- **Dataset** — the read contract that lets one resource consume another's data: a Dashboard visual binds to a `DatasetReference` ([dashboard data binding](dashboard-data-binding/design.md)), an Email binds one for merge fields ([email personalization](email-personalization/design.md)), and a Program both binds one as its audience and serves one as its funnel status ([program resource](program-resource/design.md)).

## Feature pages

- [Resource explorer](explorer/design.md) — the shell: Home, list, create flow, resource page, blades, command bar
- [Resource service menu](resource-service-menu/design.md) — Home's drawer behind a hamburger: All, Favorites, Recent, Tags and the bin as sibling routes over one list surface
- [List filters & views](list-filters-and-views/design.md) — the list workbench: filter pills, URL-synced state, bulk operations, column chooser, grouping, CSV export
- [Summary view](summary-view/design.md) — the `/all` List/Summary toggle: per-type count cards over a grouped count procedure
- [Resource page parity](resource-page-parity/design.md) — labeled command bar with overflow, Refresh, Duplicate, a delete the bin undoes, save-conflict surface
- [Share to esbabbler](share-to-esbabbler/design.md) — Share command posting a published resource's public link into a room you pick
- [Notifications bell](notifications/design.md) — session-scoped operation-outcome toasts + the dock's notifications panel
- [TodoList agent follow-ups](todolist-agent-follow-ups/design.md) — Claude Code sessions write the follow-ups they leave into the list and drain them until none is left, through the follow-ups plugin and the MCP endpoint
- [TodoList due reminders](todolist-due-reminders/design.md) — web-push when a TodoList item comes due, over the scheduled-job + push subsystems
- [TodoList completion](todolist-completion/design.md) — a checkbox on every row, a collapsible Completed section, and delete from the row's context menu
- [TodoList importance](todolist-importance/design.md) — a star on every row, and a Sort menu that orders the view but never the list
- [TodoList manual order](todolist-manual-order/design.md) — open todos dragged or Alt+arrowed into the reader's own order
- [TodoList print list](todolist-print-list/design.md) — Export → Print, with the steps and notes as toggles and the list in the reader's sort
- [TodoList recurrence](todolist-recurrence/design.md) — a dated todo repeats, and ticking it rolls it to its next due date
- [TodoList quick add](todolist-quick-add/design.md) — an Add a todo field that adds on Enter, with search folded into a button
- [TodoList steps](todolist-steps/design.md) — a flat checklist inside a todo, ticked in its dialog and counted on its row
- [TodoList task rows](todolist-task-rows/design.md) — a title, one metadata line and the notes in full, in place of the Items table
- [Global search](global-search/design.md) — grouped as-you-type in the `Ctrl+K` command palette, keyboard chords, relevance-ranked results
- [Global search relevance](global-search-relevance/design.md) — `pg_trgm` trigram index and `similarity()` ranking, so a typo still finds its resource
- [Favorites & recents](favorites-and-recents/design.md) — server-side stars and server-side opens, as Home tabs and as full list routes
- [Resource tags](tags/design.md) — name:value pairs in Essentials, edited in place, filterable on `/all`
- [Recycle bin](recycle-bin/design.md) — soft delete with restore, permanent purge, and a 30-day timer sweep
- [Delete-time reference warning](delete-reference-warning/design.md) — a delete confirmation naming the other resources that use what is being deleted
- [Resource references](resource-references/design.md) — the Overview's Related resources card: what uses a resource and what it uses, each a link
- [Activity log](activity-log/design.md) — the per-resource audit trail blade, in Azure Table Storage
- [Resource snapshots](resource-snapshots/design.md) — published versions and revisions of the working copy in one version history panel, with preview, restore and undo
- [Resource version store](resource-version-store/design.md) — every retained version as a content-addressed keyframe or delta, so a run of edits costs a compressed copy plus the edits rather than a copy per version
- [Resource save state](resource-save-state/design.md) — one derived state in the blade toolbar saying whether the open resource's edits have reached the server, and when
- [Delta content saves](delta-content-saves/design.md) — a large document's save as a zstd delta against the bytes the server stores, falling back to a full save on any mismatch
- [Shell cohesion](shell-cohesion/design.md) — the shared chrome primitives (page header, breadcrumbs, empty/loading states, launcher)
- [Breadcrumb trail](breadcrumb-trail/design.md) — crumbs are the click path, the current page is the title, and a direct link shows no ancestor at all
- [Sheet resource](sheet-resource/design.md) — CSV/JSON/XLSX files as resources with Data + Settings blades
- [Create from file](create-from-file/design.md) — drop a CSV/JSON/XLSX on the Sheet create form and land in a ready Data blade
- [Sheet editor](sheet/README.md) — the grid editor behind the Sheet resource's Data blade: inline editing, data cleaning, computed columns, statistics, clipboard
- [Survey resource](survey-resource/design.md) — SurveyJS authoring, public respondent page, responses dataset
- [Program resource](program-resource/design.md) — the distribution orchestrator: audience + email + survey bindings, opaque participant tokens, funnel status
- [Note resource](note-resource/design.md) — a rich-text document type on Tiptap: JSON at rest, publishable `generateHTML` read view
- [Note slash menu](note-slash-menu/design.md) — `/` opens a filterable block menu at the caret, drawn by the editor on the composer's suggestion stack
- [Blueprint resource](blueprint-resource/design.md) — a parameterized manifest of resources: deploy one blueprint, get a fully wired set with all the right cross-references
- [Blueprint capture](blueprint-capture/design.md) — Save as blueprint on selected resources: contents captured, cross-resource ids rewritten to aliases automatically
- [Survey response controls](survey-response-controls/design.md) — the accepting-responses toggle and the closed state that keeps participant links alive
- [Survey response modes](survey-response-modes/design.md) — Anonymous or Identified identity, enforced at the write boundary
- [Survey response summary](survey-response-summary/design.md) — the Responses blade opens on one chart, range or answer list per question
- [Survey response management](survey-response-management/design.md) — response detail, owner delete, response count on Overview
- [Published view analytics](published-view-analytics/design.md) — best-effort view counts on public reads for every publishable type
- [Dashboard data binding](dashboard-data-binding/design.md) — visuals bound to datasets with client aggregation and publish-time snapshots
- [Dashboard duplicate visual](dashboard-duplicate-visual/design.md) — Duplicate on a tile's corner copies its chart settings and binding
- [Dashboard live canvas](dashboard-live-canvas/design.md) — the editor draws each tile as its real visual over its bound data, not a stock icon
- [Dashboard chart interaction](dashboard-chart-interaction/design.md) — the ApexCharts v6 investigation surface on visuals: linked highlighting, shareable view state, annotations
- [Dashboard grid](dashboard-grid/design.md) — the dashboard's own placement and drag grid: pure placement functions, Pointer Events, one write per gesture
- [Email personalization](email-personalization/design.md) — merge fields, survey invite blocks, personalized HTML export
- [Dataset row-cap warning](dataset-row-cap-warning/design.md) — "showing N of M" wherever a dataset read hits the 1000-row cap
- [Dataset CSV export](dataset-csv-export/design.md) — Export CSV on any dataset-serving resource: survey answers with question titles as headers, formula cells neutralised
- [Email preview text](email-preview-text/design.md) — the inbox line under the subject, written into the MJML as its `mj-preview`
- [Email web view](email-web-view/design.md) — Email is Publishable: save-time HTML capture, `/view/Email/[id]` browser copy
- [Flowchart connectors](flowchart-connectors/design.md) — arrowheads, right-angled paths, edge labels and a panel for a selected edge
- [Flowchart publish](flowchart-publish/design.md) — Flowchart is Publishable: read-only VueFlow render at `/view/Flowchart/[id]`
- [Flowchart image export](flowchart-image-export/design.md) — export the whole diagram as PNG or SVG from the resource menu
- [Resource file assets](resource-file-assets/design.md) — the FileAssets capability: hosted binary assets + GrapesJS Asset Manager
- [Storage quotas](storage-quotas/design.md) — per-user blob allowance held at SAS issuance and charged by Storage's own `BlobCreated` event, with a usage bar in the explorer shell's header
- [Webpage survey invite blocks](webpage-survey-invite-blocks/design.md) — published surveys as drag-in invite buttons in both GrapesJS editors
- [Webpage plugin: countdown](webpage-plugin-countdown/design.md) — the countdown block, our own plugin in place of `grapesjs-component-countdown`
- [Webpage plugin: custom code](webpage-plugin-custom-code/design.md) — the custom code block, our own plugin in place of `grapesjs-custom-code`
- [Webpage plugin: forms](webpage-plugin-forms/design.md) — the form components, our own plugin in place of `grapesjs-plugin-forms`
- [Webpage plugin: basic blocks](webpage-plugin-blocks-basic/design.md) — the webpage editor's layout and content blocks, our own plugin in place of `grapesjs-blocks-basic`
- [Page builder document model](page-builder/document-model/design.md) — the webpage and email documents as typed node trees, their registries, the webpage renderer and the server's strict email compile
- [Page builder undo as patches](page-builder/undo-as-patches/design.md) — each open resource's undo and redo as JSON Patch operations with their inverses, one entry per interaction, cleared on reload

Open work is in the [roadmap](../../changes/resource-roadmap/tasks.md); the Azure-portal-parity designs it references live under [proposals](../../changes/). Ideas we chose not to pursue are under [deferred](../../deferred/resource/) (with revisit triggers) and [rejected](../../rejected/resource/). The grid editor keeps its own roadmap, deferred and rejected pages beside it, under [sheet editor](sheet/README.md).

## Shipped log

One line per program of work; the feature pages above carry the detail. The fact worth keeping at this level is
what the whole program cost: one Azure Table for the activity blade, one Service Bus queue for reminders, one
Event Grid subscription on a system topic that already existed, and a handful of Postgres migrations — no new
Azure service at any point.

- **Resource Explorer consolidation** — every product became a resource behind one explorer: the `resources` and `resource_publications` tables, one `ResourceAssets` container replacing six, the `createResourceProcedures` factory, and every per-editor page, picker and hub deleted.
- **Capabilities** — Publishable, DatasetProvider, Portable and FileAssets, each adopted by the types that declare them rather than rebuilt per type.
- **Explorer surface** — the list workbench, summary view, service menu, command-bar parity, global search and its trigram ranking, favorites, recents, tags, the recycle bin, activity log, and version history.
- **Resource types** — Sheet (renamed from File), Survey, Program, Note and Blueprint, plus publish parity for Email and Flowchart.
- **Datasets** — the read contract one resource consumes another through: dashboard visual binding, email merge fields, and the Program funnel status, with the row cap surfaced wherever a read hits it, and one Export CSV over every dataset provider.
- **TodoList to a todo product** — Microsoft To Do's lean core over the TodoList: task rows, completion, quick add, importance, manual order, steps, print list and recurrence, each an optional field or a view so no stored list needed a backfill.
- **TodoList agent follow-ups** — Claude Code sessions capture the follow-ups they leave into the TodoList and drain them, over one MCP endpoint any procedure opts into and an API key table in `auth`; no new Azure service and no model inside the app.
- **[Webpage social preview](webpage-social-preview/design.md)** — the Webpage's Settings blade sets the description and share image its published page unfurls with, over the site's own.
- **Resource services** — storage quotas charged by Storage's own `BlobCreated` event, TodoList due reminders on the scheduled-job stack, the notifications bell, and version history re-based onto content-addressed keyframes and deltas in a workspace package of its own.
