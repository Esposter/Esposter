---
title: Resource Explorer Consolidation
description: The shipped six-phase program that turned every editor and the surveyer into resources behind one explorer — the durable record.
---

# Resource Explorer consolidation (Phases 1–6, shipped)

The consolidation program that turned every editor + the surveyer into resources ([/docs/architecture/resources](/docs/architecture/resources)) rendered by one Azure-portal-like [explorer](/docs/platform/resource-explorer). Six phases, all shipped; existing documents/surveys data was discarded by design. This page keeps only the durable record — current-state detail lives in the feature pages and [architecture standards](/docs/architecture).

## What shipped, per phase

1. **Schema + factory + container** — `documents` → `resources` (+ `ResourceType` enum), publish normalized into `resource_publications` (row exists iff published), `AzureContainer.ResourceAssets` replacing six per-editor containers, `ResourceDefinitionMap` + capability unions, `createResourceProcedures` factory (conditional publish procedures, `transformPublishedContent`/`transformReadContent` hooks), cross-type `resource.readResources`.
2. **Explorer shell** — `/resources` Home (search + quick-create + recents), `/resources/all` list, `/resources/create[/type]` gallery + form, `/resources/[id]/[[blade]]` two-flex-box page, `useResource(id)`, `/view/[type]/[id]` public dispatch.
3. **Thin editors migrated** (Flowchart → Email → Webpage + Dashboard) — routers onto the factory, editors became inline Editor blades (`ResourceEditorComponentMap`, `<ClientOnly><Suspense>` in `BladeOutlet`), stores retargeted to `useResource`, `PortableFormat` reshaped to self-contained async `export()`/`import()`, `ViewComponentMap` renderers, per-editor pages/launcher entries deleted.
4. **File split + TodoList** — `ResourceType.Table` died; `fileResourceSchema` (`{ settings, data }`) + Data/Settings blades, `todoListSchema` + Items/Calendar blades, command/undo stack re-seamed onto `DataSource`, dataset provider re-keyed `TableDocument` → `File`.
5. **Survey fold** — `surveys` table/`AzureContainer.SurveyAssets` deleted; survey rides the factory with response/SAS procedures kept, publish clones assets under `{id}/published/{v}/…` with baked SAS URLs, Editor (SurveyJS creator) + Responses blades, respondent renderer in `ViewComponentMap`.
6. **Deletions + sweep** — router renames (`flowchartEditor` → `flowchart`, `emailEditor` → `email`, `webpageEditor` → `webpage`), achievement `triggerPath`s re-keyed, dead `RoutePath` members dropped, grep sweep green.

## Durable gotchas

- **Content class names are frozen.** `FlowchartEditor`/`EmailEditor`/`WebpageEditor` classes (and their `store/`/`models/`/`services/` folder names) keep the legacy names — they are registered in `JSONClassMap`, so renaming breaks superjson deserialization of persisted blobs.
- **Publish snapshots** live at `{id}/published/{n}/…`; Survey bakes 1-year SAS URLs at publish (`transformPublishedSurvey`) and re-signs working-copy URLs on read (`transformReadSurvey`).
- **Create writes no blob** — the content blob first exists at the first `saveResourceContent`; one blob, one `contentVersion`, optimistic concurrency on save.
- Publish **status** is deliberately not a `/all` list column — it is a capability surfaced on the Overview blade.
- Migrations: `20260707004532_aberrant_emma_frost` (documents → resources + publish split), `20260710120004_talented_slayback` (drop `surveys`, drop `Table` from `resource_type`).
- Zero new dependencies and zero new Azure services were added across all six phases — one renamed table, one container replacing six, reshaped routers.
